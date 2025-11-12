import pandas as pd

def normalizar_cnpj_e_salvar_xlsx(csv_input, xlsx_output):
    """
    Normaliza o campo de CNPJ de um arquivo CSV, removendo caracteres
    não numéricos, e salva o resultado em um arquivo XLSX.

    Args:
        csv_input (str): O caminho para o arquivo CSV de entrada.
        xlsx_output (str): O caminho para o arquivo XLSX de saída.
    """
    try:
        # Carrega o arquivo CSV, especificando o ponto e vírgula como separador
        # e ignorando linhas mal formatadas
        df = pd.read_csv(csv_input, sep=';', on_bad_lines='skip')

        # Verifica se a coluna 'CNPJ' existe no DataFrame
        if 'CNPJ' not in df.columns:
            print("Erro: A coluna 'CNPJ' não foi encontrada no arquivo CSV. Verifique o nome da coluna no cabeçalho.")
            # Exibe as colunas encontradas para ajudar na depuração
            print("Colunas encontradas:", df.columns.tolist())
            return

        # Preenche valores NaN (ausentes) com uma string vazia para evitar erros
        df['CNPJ'] = df['CNPJ'].fillna('')

        # Normaliza a coluna 'CNPJ' removendo todos os caracteres não numéricos
        df['CNPJ'] = df['CNPJ'].astype(str).str.replace(r'\D', '', regex=True)
        
        df['CNPJ'] = df['CNPJ'].apply(lambda x: x.zfill(14) if x else '')

        # Salva o DataFrame em um arquivo XLSX
        df.to_excel(xlsx_output, index=False)
        
        print(f"Dados normalizados e salvos com sucesso em '{xlsx_output}'")

    except FileNotFoundError:
        print(f"Erro: O arquivo '{csv_input}' não foi encontrado.")
    except Exception as e:
        print(f"Ocorreu um erro: {e}")


# --- Exemplo de uso ---
if __name__ == '__main__':
    arquivo_csv = r'C:\Users\marce\OneDrive\Área de Trabalho\CLARO\03-BASE_JA_FILTRADA\PJ\BASE_CLARO_PJ_1_validado.csv'
    arquivo_xlsx = r'C:\Users\marce\OneDrive\Área de Trabalho\CLARO\03-BASE_JA_FILTRADA\PJ\BASE_CLARO_PJ_1_validado.xlsx'

    normalizar_cnpj_e_salvar_xlsx(arquivo_csv, arquivo_xlsx)
    
