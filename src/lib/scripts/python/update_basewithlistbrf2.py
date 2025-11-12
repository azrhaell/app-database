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
        # TODAS EM MAIÚSCULAS para corresponder à padronização
        colunas_para_extrair = [
            'CNPJ', 
            'RAZAO_SOCIAL',
            'NOME_FANTASIA',
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

        # Verifica se a coluna CNPJ existe
        if 'CNPJ' not in df_xlsx.columns:
            print(f"Erro: A coluna 'CNPJ' não foi encontrada no arquivo XLSX.")
            print(f"Colunas disponíveis: {list(df_xlsx.columns)}")
            return

        # Padroniza os CNPJs do XLSX (remove pontuação e preenche com zeros à esquerda)
        df_xlsx['CNPJ'] = df_xlsx['CNPJ'].astype(str).str.replace(r'[\.\-\/\s]', '', regex=True).str.zfill(14)

        # --- 2. LEITURA DOS CSVs ---
        
        # Dicionário principal para armazenar todos os dados dos CSVs
        # Estrutura: {cnpj: {'NATUREZA_JURIDICA': 'valor', 'CAPITAL_SOCIAL': 'valor', ...}}
        cnpj_data_map = {}
        
        print(f"\nIniciando leitura dos arquivos CSV em: {caminho_pasta_csvs}")
        arquivos_processados = 0
        
        for filename in os.listdir(caminho_pasta_csvs):
            if filename.endswith(".csv"):
                caminho_completo_csv = os.path.join(caminho_pasta_csvs, filename)
                print(f"Lendo arquivo: {filename}...")
                
                try:
                    # Lê o CSV (lendo tudo como string para segurança)
                    df_csv_raw = pd.read_csv(
                        caminho_completo_csv, 
                        sep=';', 
                        on_bad_lines='skip', 
                        low_memory=False, 
                        dtype=str,
                        # MUDANÇA 1: Alterado de 'latin-1' para 'utf-8', conforme sua descrição
                        encoding='utf-8' 
                    )
                    
                    # --- NOVAS LINHAS PARA ROBUSTEZ E DEBUG ---
                    
                    # MUDANÇA 2: Padroniza nomes de colunas (remove espaços e força maiúsculas)
                    # Isso resolve problemas como " cnpj " ou "Cnpj"
                    df_csv_raw.columns = df_csv_raw.columns.str.strip().str.upper()
                    
                    # MUDANÇA 3: Log de diagnóstico. Isso mostrará as colunas EXATAS
                    # que o Pandas encontrou no arquivo.
                    print(f"  [DEBUG] Colunas encontradas em {filename}: {list(df_csv_raw.columns)}")
                    
                    # --- FIM DAS NOVAS LINHAS ---

                    # Verifica quais das colunas desejadas realmente existem no arquivo
                    colunas_encontradas = [col for col in colunas_para_extrair if col in df_csv_raw.columns]
                    colunas_faltantes = [col for col in colunas_para_extrair if col not in df_csv_raw.columns]
                    
                    if 'CNPJ' not in colunas_encontradas:
                        print(f"  [AVISO] Arquivo {filename} pulado. Coluna 'CNPJ' nao encontrada.")
                        continue
                        
                    if colunas_faltantes:
                        print(f"  [INFO] Em {filename}, colunas nao encontradas: {colunas_faltantes}")

                    # Filtra o DataFrame do CSV para ter apenas as colunas que encontramos
                    df_csv = df_csv_raw[colunas_encontradas].copy()

                    # Padroniza a coluna CNPJ do CSV
                    # Remove todos os caracteres não numéricos e preenche com zeros à esquerda
                    df_csv['CNPJ'] = df_csv['CNPJ'].astype(str).str.replace(r'[^\d]', '', regex=True).str.zfill(14)
                    
                    # Remove linhas onde o CNPJ é nulo, vazio ou inválido
                    df_csv = df_csv[df_csv['CNPJ'].notna()]
                    df_csv = df_csv[df_csv['CNPJ'].str.len() == 14]
                    df_csv = df_csv[df_csv['CNPJ'] != '00000000000000']
                    
                    # Remove duplicados (mantém o último)
                    df_csv = df_csv.drop_duplicates(subset=['CNPJ'], keep='last')
                    
                    if len(df_csv) == 0:
                        print(f"  [AVISO] Nenhum CNPJ valido encontrado em {filename}")
                        continue
                    
                    # Define o CNPJ como índice para facilitar a conversão para dicionário
                    df_csv = df_csv.set_index('CNPJ')

                    # Converte o DataFrame para um dicionário no formato {cnpj: {col: val, ...}}
                    novos_dados = df_csv.to_dict('index')
                    
                    # Atualiza o dicionário principal. 
                    # Se houver CNPJs duplicados entre arquivos, o do último arquivo lido prevalece.
                    cnpj_data_map.update(novos_dados)
                    arquivos_processados += 1
                    print(f"  [OK] {len(novos_dados)} CNPJs validos carregados de {filename}")

                except Exception as e:
                    print(f"  [ERRO] Nao foi possivel processar o arquivo {filename}. Erro: {e}")
        
        if not cnpj_data_map:
            print("\n[ERRO] Nenhum dado valido foi encontrado nos arquivos CSV. A operacao sera cancelada.")
            return

        print(f"\n[INFO] Total: {len(cnpj_data_map)} CNPJs unicos com dados foram carregados de {arquivos_processados} arquivo(s) CSV.")

        # --- 3. ATUALIZAÇÃO DO DATAFRAME XLSX ---

        print("\n[INFO] Iniciando cruzamento e atualizacao dos dados...")

        # Converte o dicionário de dados em um DataFrame
        # O índice deste DataFrame será o CNPJ
        df_map = pd.DataFrame.from_dict(cnpj_data_map, orient='index')
        
        print(f"[INFO] Colunas encontradas nos CSVs: {list(df_map.columns)}")
        
        # Guarda o índice original do XLSX para manter a ordem
        df_xlsx['_ordem_original'] = range(len(df_xlsx))
        
        # Define 'CNPJ' como índice no DataFrame do Excel para o 'join'
        df_xlsx = df_xlsx.set_index('CNPJ')

        # Realiza o 'join' (junção) dos dados.
        # Adiciona um sufixo '_new' às colunas vindas do 'df_map' para evitar conflitos
        df_xlsx = df_xlsx.join(df_map, rsuffix='_new', how='left')

        # Encontra quais CNPJs foram encontrados nos CSVs
        # Verifica se alguma das colunas novas foi preenchida
        colunas_new = [col for col in df_xlsx.columns if col.endswith('_new')]
        
        if len(colunas_new) == 0:
            print("\n[AVISO] Nenhuma correspondencia foi encontrada entre os arquivos. Verifique o formato dos CNPJs.")
            # Não vamos parar; vamos salvar o arquivo mesmo sem correspondências.
            # return <-- removido
        
        # Usa a primeira coluna '_new' como referência para saber se houve match
        # Se não houver colunas new, cnpjs_atualizados será 0
        coluna_referencia_match = None
        if colunas_new:
            coluna_referencia_match = colunas_new[0]

        cnpjs_atualizados = 0
        if coluna_referencia_match:
            # 1. Atualiza o STATUS RECEITA FEDERAL
            # Onde a 'coluna_referencia_match' NÃO for nula, significa que encontramos o CNPJ
            if 'STATUS RECEITA FEDERAL' not in df_xlsx.columns:
                df_xlsx['STATUS RECEITA FEDERAL'] = None
                
            df_xlsx['STATUS RECEITA FEDERAL'] = np.where(
                df_xlsx[coluna_referencia_match].notna(), 
                'ATIVA', 
                df_xlsx['STATUS RECEITA FEDERAL'] # Mantém o valor original
            )
            
            # Conta quantos CNPJs foram atualizados
            cnpjs_atualizados = df_xlsx[coluna_referencia_match].notna().sum()
            
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

        print(f"[INFO] {cnpjs_atualizados} CNPJs foram encontrados e terao seus dados atualizados.")

        # Restaura a ordem original
        df_xlsx = df_xlsx.sort_values('_ordem_original')
        df_xlsx = df_xlsx.drop(columns=['_ordem_original'])
        
        # Restaura o 'CNPJ' de índice para coluna
        df_xlsx = df_xlsx.reset_index()
        
        # --- 4. SALVAMENTO ---

        # Salva o DataFrame modificado em um novo arquivo XLSX
        print(f"\n[INFO] Salvando arquivo atualizado em: {caminho_saida_xlsx}")
        df_xlsx.to_excel(caminho_saida_xlsx, index=False)

        print(f"\n[OK] Processamento concluido com sucesso!")
        print(f"[INFO] Total de registros no arquivo final: {len(df_xlsx)}")

    except FileNotFoundError as e:
        print(f"[ERRO] Um dos caminhos especificados nao foi encontrado: {e}")
    except Exception as e:
        print(f"[ERRO] Ocorreu um erro inesperado: {e}")
        import traceback
        traceback.print_exc()

# --- Exemplo de uso ---
# Defina os caminhos dos seus arquivos e da pasta
caminho_da_pasta_csvs = r"d:\Github\Vivo_Database\app-database\public\BRF"
caminho_do_xlsx = r'C:\Users\marce\OneDrive\Área de Trabalho\CLARO\03-BASE_JA_FILTRADA\PJ\BASE_CLARO_PJ_1_validado.xlsx'
# Mudei o nome do arquivo de saída para refletir a nova operação
caminho_do_novo_xlsx = r'C:\Users\marce\OneDrive\Área de Trabalho\CLARO\03-BASE_JA_FILTRADA\PJ\BASE_CLARO_PJ_1_validado - CRUZAMENTO RECEITA.xlsx'

# Chama a função atualizada
enriquecer_base_cnpj(caminho_do_xlsx, caminho_da_pasta_csvs, caminho_do_novo_xlsx)