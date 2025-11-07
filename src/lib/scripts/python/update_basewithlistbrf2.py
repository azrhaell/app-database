import pandas as pd
import os
import numpy as np

def enriquecer_base_cnpj(caminho_xlsx, caminho_pasta_csvs, caminho_saida_xlsx):
    """
    Compara um arquivo XLSX com vários arquivos CSV de uma pasta e atualiza
    o status e múltiplas colunas (Natureza Jurídica, Capital Social, etc.)
    dos CNPJs no XLSX.

    Todos os CNPJs do arquivo XLSX que também estiverem presentes em qualquer
    um dos arquivos CSV terão seu status alterado para 'ATIVA' e suas colunas
    correspondentes preenchidas com os valores dos CSVs.

    A função garante que todos os CNPJs tenham 14 caracteres, adicionando
    zeros à esquerda e removendo pontuação, se necessário.

    Args:
        caminho_xlsx (str): O caminho para o arquivo XLSX de entrada.
        caminho_pasta_csvs (str): O caminho da pasta que contém os arquivos CSV.
        caminho_saida_xlsx (str): O caminho onde o novo arquivo XLSX será salvo.
    """
    try:
        # --- 1. PREPARAÇÃO ---
        
        # Colunas que queremos extrair dos arquivos CSV
        colunas_para_extrair = [
            'CNPJ', 
            'NATUREZA_JURIDICA', 
            'CAPITAL_SOCIAL', 
            'PORTE_EMPRESA', 
            'OPCAO_SIMPLES', 
            'OPCAO_MEI'
        ]
        # Colunas que serão atualizadas/adicionadas no Excel
        colunas_para_atualizar = colunas_para_extrair[1:] # Todas, exceto 'CNPJ'

        # Carrega os dados do arquivo XLSX
        print(f"Lendo arquivo XLSX de origem: {caminho_xlsx}")
        df_xlsx = pd.read_excel(caminho_xlsx)

        # Padroniza os CNPJs do XLSX
        df_xlsx['CNPJ'] = df_xlsx['CNPJ'].astype(str).str.replace(r'[\.\-\/]', '', regex=True).str.zfill(14)

        # --- 2. LEITURA DOS CSVs ---
        
        # Dicionário principal para armazenar todos os dados dos CSVs
        # Estrutura: {cnpj: {'NATUREZA_JURIDICA': 'valor', 'CAPITAL_SOCIAL': 'valor', ...}}
        cnpj_data_map = {}
        
        print(f"Iniciando leitura dos arquivos CSV em: {caminho_pasta_csvs}")
        for filename in os.listdir(caminho_pasta_csvs):
            if filename.endswith(".csv"):
                caminho_completo_csv = os.path.join(caminho_pasta_csvs, filename)
                print(f"Lendo arquivo: {filename}...")
                
                try:
                    # Lê o CSV (lendo tudo como string para segurança)
                    df_csv_raw = pd.read_csv(caminho_completo_csv, sep=';', on_bad_lines='skip', low_memory=False, dtype=str)
                    
                    # Verifica quais das colunas desejadas realmente existem no arquivo
                    colunas_encontradas = [col for col in colunas_para_extrair if col in df_csv_raw.columns]
                    colunas_faltantes = [col for col in colunas_para_extrair if col not in df_csv_raw.columns]
                    
                    if 'CNPJ' not in colunas_encontradas:
                        print(f"Atenção: Arquivo {filename} pulado. Coluna 'CNPJ' não encontrada.")
                        continue
                        
                    if colunas_faltantes:
                        print(f"Atenção: Em {filename}, colunas não encontradas: {colunas_faltantes}")

                    # Filtra o DataFrame do CSV para ter apenas as colunas que encontramos
                    df_csv = df_csv_raw[colunas_encontradas].copy()

                    # Padroniza a coluna CNPJ do CSV
                    df_csv['CNPJ'] = df_csv['CNPJ'].astype(str).str.replace(r'[\.\-\/]', '', regex=True).str.zfill(14)
                    
                    # Remove linhas onde o CNPJ é nulo ou duplicado (mantém o último)
                    df_csv = df_csv.dropna(subset=['CNPJ'])
                    df_csv = df_csv.drop_duplicates(subset=['CNPJ'], keep='last')
                    
                    # Define o CNPJ como índice para facilitar a conversão para dicionário
                    df_csv = df_csv.set_index('CNPJ')

                    # Converte o DataFrame para um dicionário no formato {cnpj: {col: val, ...}}
                    novos_dados = df_csv.to_dict('index')
                    
                    # Atualiza o dicionário principal. 
                    # Se houver CNPJs duplicados entre arquivos, o do último arquivo lido prevalece.
                    cnpj_data_map.update(novos_dados)

                except Exception as e:
                    print(f"Atenção: Não foi possível processar o arquivo {filename}. Erro: {e}")
        
        if not cnpj_data_map:
            print("Nenhum dado válido foi encontrado nos arquivos CSV. A operação será cancelada.")
            return

        print(f"\n{len(cnpj_data_map)} CNPJs únicos com dados foram carregados da pasta CSV.")

        # --- 3. ATUALIZAÇÃO DO DATAFRAME XLSX ---

        print("Iniciando cruzamento e atualização dos dados...")

        # Converte o dicionário de dados em um DataFrame
        # O índice deste DataFrame será o CNPJ
        df_map = pd.DataFrame.from_dict(cnpj_data_map, orient='index')
        
        # Define 'CNPJ' como índice no DataFrame do Excel para o 'join'
        df_xlsx = df_xlsx.set_index('CNPJ')

        # Realiza o 'join' (junção) dos dados.
        # Adiciona um sufixo '_new' às colunas vindas do 'df_map' para evitar conflitos
        df_xlsx = df_xlsx.join(df_map, rsuffix='_new')

        # Pega o nome da primeira coluna que veio do map para usar como referência de "match"
        # (Ex: 'NATUREZA_JURIDICA_new')
        coluna_referencia_match = df_map.columns[0] + '_new'

        # 1. Atualiza o STATUS RECEITA FEDERAL
        # Onde a 'coluna_referencia_match' NÃO for nula, significa que encontramos o CNPJ
        df_xlsx['STATUS RECEITA FEDERAL'] = np.where(
            df_xlsx[coluna_referencia_match].notna(), 
            'ATIVA', 
            df_xlsx['STATUS RECEITA FEDERAL'] # Mantém o valor original
        )
        
        # 2. Atualiza/Insere as outras colunas
        for col in colunas_para_atualizar:
            col_new = col + '_new'
            
            # Verifica se a coluna realmente foi lida dos CSVs
            if col_new in df_xlsx.columns:
                
                # Se a coluna original (ex: 'CAPITAL_SOCIAL') já existe no Excel...
                if col in df_xlsx.columns:
                    # ... usa 'combine_first' para preencher os 'NaN' da coluna nova
                    # com os valores da coluna antiga.
                    # Ou seja, o dado novo (do CSV) tem prioridade.
                    df_xlsx[col] = df_xlsx[col_new].combine_first(df_xlsx[col])
                else:
                    # Se a coluna não existia no Excel, apenas a renomeia
                    df_xlsx[col] = df_xlsx[col_new]
                
                # Remove a coluna temporária '_new'
                df_xlsx = df_xlsx.drop(columns=[col_new])

        # Restaura o 'CNPJ' de índice para coluna
        df_xlsx = df_xlsx.reset_index()
        
        # --- 4. SALVAMENTO ---

        # Salva o DataFrame modificado em um novo arquivo XLSX
        print(f"\nSalvando arquivo atualizado em: {caminho_saida_xlsx}")
        df_xlsx.to_excel(caminho_saida_xlsx, index=False)

        print(f"Processamento concluído com sucesso!")

    except FileNotFoundError:
        print("Erro: Um dos caminhos especificados não foi encontrado. Verifique o caminho para o arquivo XLSX ou a pasta dos CSVs.")
    except KeyError as e:
        print(f"Erro: Verifique se a coluna 'CNPJ' existe no arquivo XLSX. Detalhes do erro: {e}")
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")

# --- Exemplo de uso ---
# Defina os caminhos dos seus arquivos e da pasta
caminho_da_pasta_csvs = r"d:\Github\Vivo_Database\app-database\public\BRF"
caminho_do_xlsx = r'D:\Github\Vivo_Database\app-database\public\MISC\BASE MOVEL 1 - CRUZAMENTO RECEITA E BDO - 05 11 25.xlsx'
# Mudei o nome do arquivo de saída para refletir a nova operação
caminho_do_novo_xlsx = r'D:\Github\Vivo_Database\app-database\public\MISC\BASE MOVEL 1 - CRUZAMENTO RECEITA E BDO - 05 11 25_BRF.xlsx'

# Chama a função atualizada
enriquecer_base_cnpj(caminho_do_xlsx, caminho_da_pasta_csvs, caminho_do_novo_xlsx)
