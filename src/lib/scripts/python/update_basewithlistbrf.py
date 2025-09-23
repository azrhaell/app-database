import pandas as pd
import os

def atualizar_status_cnpj_multiplos_csvs(caminho_xlsx, caminho_pasta_csvs, caminho_saida_xlsx):
    """
    Compara um arquivo XLSX com vários arquivos CSV de uma pasta e atualiza o status de CNPJs no XLSX.

    Todos os CNPJs do arquivo XLSX que também estiverem presentes em qualquer
    um dos arquivos CSV terão seu status alterado para 'ATIVA'. A função
    garante que todos os CNPJs tenham 14 caracteres, adicionando zeros à esquerda
    se necessário.

    Args:
        caminho_xlsx (str): O caminho para o arquivo XLSX de entrada.
        caminho_pasta_csvs (str): O caminho da pasta que contém os arquivos CSV.
        caminho_saida_xlsx (str): O caminho onde o novo arquivo XLSX será salvo.
    """
    try:
        # Carrega os dados do arquivo XLSX
        df_xlsx = pd.read_excel(caminho_xlsx)

        # Padroniza os CNPJs do XLSX para o formato de string com 14 caracteres e sem caracteres especiais
        df_xlsx['CNPJ'] = df_xlsx['CNPJ'].astype(str).str.zfill(14).str.replace('-', '', regex=False)

        # Coleta todos os CNPJs de todos os arquivos CSV em um único conjunto
        cnpjs_csv_set = set()
        
        # Itera sobre todos os arquivos na pasta de CSVs
        for filename in os.listdir(caminho_pasta_csvs):
            if filename.endswith(".csv"):
                caminho_completo_csv = os.path.join(caminho_pasta_csvs, filename)
                print(f"Lendo arquivo: {filename}...")
                
                # Tenta ler o arquivo CSV com o separador ';'
                try:
                    df_csv = pd.read_csv(caminho_completo_csv, sep=';', on_bad_lines='skip', low_memory=False)
                    
                    # Assume que a coluna CNPJ é a primeira, acessando por df_csv.columns[0]
                    # Padroniza a coluna CNPJ do CSV para string com 14 caracteres e sem caracteres especiais
                    coluna_cnpj_csv = df_csv[df_csv.columns[0]].astype(str).str.zfill(14).str.replace('-', '', regex=False)
                    
                    # Adiciona os CNPJs do arquivo atual ao conjunto principal
                    cnpjs_csv_set.update(coluna_cnpj_csv)

                except Exception as e:
                    print(f"Atenção: Não foi possível ler o arquivo {filename}. Erro: {e}")
        
        if not cnpjs_csv_set:
            print("Nenhum CNPJ válido foi encontrado nos arquivos CSV. A operação será cancelada.")
            return

        # Atualiza o status no DataFrame do XLSX
        # Utiliza uma list comprehension para um desempenho mais rápido
        df_xlsx['STATUS RECEITA FEDERAL'] = ['ATIVA' if cnpj in cnpjs_csv_set else status
                                           for cnpj, status in zip(df_xlsx['CNPJ'], df_xlsx['STATUS RECEITA FEDERAL'])]

        # Salva o DataFrame modificado em um novo arquivo XLSX
        df_xlsx.to_excel(caminho_saida_xlsx, index=False)

        print(f"\nProcessamento concluído. {len(cnpjs_csv_set)} CNPJs únicos foram encontrados nos CSVs.")
        print(f"Arquivo atualizado com sucesso! Salvo em: {caminho_saida_xlsx}")

    except FileNotFoundError:
        print("Erro: Um dos caminhos especificados não foi encontrado. Verifique o caminho para o arquivo XLSX ou a pasta dos CSVs.")
    except KeyError as e:
        print(f"Erro: Verifique se as colunas 'CNPJ' e 'STATUS RECEITA FEDERAL' existem no arquivo XLSX. Detalhes do erro: {e}")
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")

# --- Exemplo de uso ---
# Defina os caminhos dos seus arquivos e da pasta
caminho_da_pasta_csvs = r"d:\Github\Vivo_Database\app-database\public\BRF"
caminho_do_xlsx = r'd:\Github\Vivo_Database\app-database\public\MISC\RJ EMPRESARIO INDIVIDUAL - SAIDA.xlsx'
caminho_do_novo_xlsx = r'd:\Github\Vivo_Database\app-database\public\MISC\RJ EMPRESARIO INDIVIDUAL - SAIDA - BRF.xlsx'

atualizar_status_cnpj_multiplos_csvs(caminho_do_xlsx, caminho_da_pasta_csvs, caminho_do_novo_xlsx)