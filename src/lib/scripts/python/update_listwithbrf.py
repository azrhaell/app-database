import pandas as pd

def atualizar_status_cnpj(caminho_xlsx, caminho_csv, caminho_saida_xlsx):
    """
    Compara um arquivo XLSX e um CSV e atualiza o status de CNPJs no XLSX.

    Os CNPJs do arquivo XLSX que também estiverem presentes no arquivo CSV
    terão seu status alterado para 'ATIVA'. A função trata a diferença
    de formato dos CNPJs (com e sem hífen) e o separador do arquivo CSV.

    Args:
        caminho_xlsx (str): O caminho para o arquivo XLSX de entrada.
        caminho_csv (str): O caminho para o arquivo CSV com os CNPJs de referência.
        caminho_saida_xlsx (str): O caminho onde o novo arquivo XLSX será salvo.
    """
    try:
        # Carrega os dados dos arquivos. O parâmetro sep=';' é adicionado aqui.
        df_xlsx = pd.read_excel(caminho_xlsx)
        df_csv = pd.read_csv(caminho_csv, sep=';')

        # Padroniza os CNPJs em ambos os DataFrames para o formato de string sem caracteres especiais
        df_xlsx['CNPJ'] = df_xlsx['CNPJ'].astype(str).str.replace('-', '', regex=False)
        
        # A coluna CNPJ é a primeira, então acessamos por df_csv.columns[0]
        df_csv_cnpjs = df_csv[df_csv.columns[0]].astype(str).str.replace('-', '', regex=False)

        # Cria um conjunto (set) de CNPJs do arquivo CSV para busca rápida
        cnpjs_csv = set(df_csv_cnpjs)

        # Atualiza o status no DataFrame do XLSX
        # A função apply() itera sobre cada linha e verifica se o CNPJ está no conjunto
        df_xlsx['STATUS RECEITA FEDERAL'] = df_xlsx.apply(
            lambda row: 'ATIVA' if row['CNPJ'] in cnpjs_csv else row['STATUS RECEITA FEDERAL'],
            axis=1
        )

        # Salva o DataFrame modificado em um novo arquivo XLSX
        df_xlsx.to_excel(caminho_saida_xlsx, index=False)

        print(f"Arquivo atualizado com sucesso! Salvo em: {caminho_saida_xlsx}")

    except FileNotFoundError:
        print("Erro: Um dos arquivos não foi encontrado. Verifique os caminhos.")
    except KeyError as e:
        print(f"Erro: Verifique se as colunas 'CNPJ' e 'STATUS RECEITA FEDERAL' existem no arquivo XLSX e a coluna 'CNPJ' existe no arquivo CSV. Detalhes do erro: {e}")
    except Exception as e:
        print(f"Ocorreu um erro: {e}")
        
# --- Exemplo de uso ---
# Substitua os caminhos abaixo pelos caminhos dos seus arquivos
# Por exemplo:
# caminho_do_xlsx = 'C:\\dados\\empresas.xlsx'
# caminho_do_csv = 'C:\\dados\\cnpjs_ativos.csv'
# caminho_do_novo_xlsx = 'C:\\dados\\empresas_atualizado.xlsx'

# Exemplo com caminhos relativos no mesmo diretório
# Caminhos dos arquivos
caminho_do_csv = r'd:\Github\Vivo_Database\app-database\public\BRF\Ativa_RJ_173,548_parte_3.csv'
caminho_do_xlsx = r'd:\Github\Vivo_Database\app-database\public\MISC\BASE - PF - INDIVIDUAL - RJ - ES - 05 08 2025 - BDO.xlsx'
caminho_do_novo_xlsx = r'd:\Github\Vivo_Database\app-database\public\MISC\BASE - PF - INDIVIDUAL - RJ - ES - 05 08 2025 - BRF.xlsx'

atualizar_status_cnpj(caminho_do_xlsx, caminho_do_csv, caminho_do_novo_xlsx)