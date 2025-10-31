import pandas as pd
import os
import numpy as np # Necessário para a atualização eficiente

def atualizar_status_e_natureza_cnpj(caminho_xlsx, caminho_pasta_csvs, caminho_saida_xlsx):
    """
    Compara um arquivo XLSX com vários arquivos CSV de uma pasta e atualiza
    o status e a natureza jurídica dos CNPJs no XLSX.

    Todos os CNPJs do arquivo XLSX que também estiverem presentes em qualquer
    um dos arquivos CSV terão seu status alterado para 'ATIVA' e sua coluna
    'NATUREZA_JURIDICA' preenchida com o valor correspondente do CSV.

    A função garante que todos os CNPJs tenham 14 caracteres, adicionando
    zeros à esquerda e removendo pontuação, se necessário.

    Args:
        caminho_xlsx (str): O caminho para o arquivo XLSX de entrada.
        caminho_pasta_csvs (str): O caminho da pasta que contém os arquivos CSV.
        caminho_saida_xlsx (str): O caminho onde o novo arquivo XLSX será salvo.
    """
    try:
        # Carrega os dados do arquivo XLSX
        df_xlsx = pd.read_excel(caminho_xlsx)

        # Padroniza os CNPJs do XLSX para o formato de string com 14 caracteres e sem caracteres especiais
        # Garante que é string antes de aplicar métodos de string
        df_xlsx['CNPJ'] = df_xlsx['CNPJ'].astype(str).str.replace(r'[\.\-\/]', '', regex=True).str.zfill(14)

        # Coleta todos os CNPJs e Naturezas Jurídicas dos CSVs em um dicionário
        # {cnpj: natureza_juridica}
        cnpj_data_map = {}
        
        # Itera sobre todos os arquivos na pasta de CSVs
        for filename in os.listdir(caminho_pasta_csvs):
            if filename.endswith(".csv"):
                caminho_completo_csv = os.path.join(caminho_pasta_csvs, filename)
                print(f"Lendo arquivo: {filename}...")
                
                # Tenta ler o arquivo CSV com o separador ';'
                try:
                    # Lê tudo como string para evitar problemas de tipo
                    df_csv = pd.read_csv(caminho_completo_csv, sep=';', on_bad_lines='skip', low_memory=False, dtype=str)
                    
                    # Verifica se as colunas necessárias existem
                    if 'CNPJ' not in df_csv.columns or 'NATUREZA_JURIDICA' not in df_csv.columns:
                        print(f"Atenção: Arquivo {filename} pulado. Colunas 'CNPJ' e/ou 'NATUREZA_JURIDICA' não encontradas.")
                        continue

                    # Padroniza a coluna CNPJ do CSV
                    df_csv['CNPJ'] = df_csv['CNPJ'].astype(str).str.replace(r'[\.\-\/]', '', regex=True).str.zfill(14)
                    
                    # Remove linhas onde o CNPJ é nulo após a limpeza
                    df_csv = df_csv.dropna(subset=['CNPJ'])

                    # Cria um dicionário com os dados do arquivo atual
                    # Isso é mais rápido que iterar linha por linha
                    novos_dados = dict(zip(df_csv['CNPJ'], df_csv['NATUREZA_JURIDICA']))
                    
                    # Atualiza o dicionário principal. 
                    # Se houver CNPJs duplicados entre arquivos, o último lido prevalece.
                    cnpj_data_map.update(novos_dados)

                except Exception as e:
                    print(f"Atenção: Não foi possível ler o arquivo {filename}. Erro: {e}")
        
        if not cnpj_data_map:
            print("Nenhum dado válido (CNPJ/Natureza) foi encontrado nos arquivos CSV. A operação será cancelada.")
            return

        print(f"\n{len(cnpj_data_map)} CNPJs únicos com dados de natureza jurídica foram carregados.")

        # --- Atualização Eficiente com .map e numpy.where ---

        # 1. Mapeia os CNPJs do XLSX para os valores de NATUREZA_JURIDICA dos CSVs
        # Se um CNPJ do XLSX não está no map, o resultado é 'NaN' (Not a Number)
        mapeamento_natureza = df_xlsx['CNPJ'].map(cnpj_data_map)
        
        # 2. Atualiza o STATUS RECEITA FEDERAL
        # np.where(condição, valor_se_verdadeiro, valor_se_falso)
        # Condição: O mapeamento NÃO é nulo (ou seja, CNPJ foi encontrado)
        df_xlsx['STATUS RECEITA FEDERAL'] = np.where(
            mapeamento_natureza.notna(), 
            'ATIVA', 
            df_xlsx['STATUS RECEITA FEDERAL'] # Mantém o valor original
        )
        
        # 3. Atualiza/Insere a NATUREZA_JURIDICA
        # Se a coluna já existir, preserva os valores antigos onde o CNPJ não foi encontrado.
        # Se não existir, cria a coluna (com 'NaN' para CNPJs não encontrados).
        if 'NATUREZA_JURIDICA' in df_xlsx.columns:
            # combine_first: usa os valores do 'mapeamento_natureza' primeiro,
            # e preenche os 'NaN' restantes com os valores da coluna original.
            df_xlsx['NATUREZA_JURIDICA'] = mapeamento_natureza.combine_first(df_xlsx['NATUREZA_JURIDICA'])
        else:
            # Se a coluna não existe, apenas a cria com os valores mapeados
            df_xlsx['NATUREZA_JURIDICA'] = mapeamento_natureza

        # Salva o DataFrame modificado em um novo arquivo XLSX
        df_xlsx.to_excel(caminho_saida_xlsx, index=False)

        print(f"\nProcessamento concluído.")
        print(f"Arquivo atualizado com sucesso! Salvo em: {caminho_saida_xlsx}")

    except FileNotFoundError:
        print("Erro: Um dos caminhos especificados não foi encontrado. Verifique o caminho para o arquivo XLSX ou a pasta dos CSVs.")
    except KeyError as e:
        print(f"Erro: Verifique se a coluna 'CNPJ' existe no arquivo XLSX. Detalhes do erro: {e}")
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")

# --- Exemplo de uso ---
# Defina os caminhos dos seus arquivos e da pasta
caminho_da_pasta_csvs = r"d:\Github\Vivo_Database\app-database\public\BRF"
caminho_do_xlsx = r'D:\Github\Nova_Base\Claro_Base\03-BASE_JA_FILTRADA\BASE_CLARO_PJ_1.xlsx'
caminho_do_novo_xlsx = r'D:\Github\Nova_Base\Claro_Base\03-BASE_JA_FILTRADA\BASE_CLARO_PJ_1 - SAIDA - BRF.xlsx'

# Chama a função atualizada
atualizar_status_e_natureza_cnpj(caminho_do_xlsx, caminho_da_pasta_csvs, caminho_do_novo_xlsx)
