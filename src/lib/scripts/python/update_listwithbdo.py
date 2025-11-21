import pandas as pd

# Caminhos dos arquivos

caminho_csv = r'D:\BDO\bdo_filtrado_RJ_ES.csv'
caminho_xlsx = r'C:\Users\marce\Downloads\CRUZAR BDO - 17 11 2025.xlsx'
caminho_saida = r'C:\Users\marce\Downloads\CRUZAR BDO - 17 11 2025 - SAIDA BDO.xlsx'

# Lê o CSV
df_csv = pd.read_csv(caminho_csv, dtype=str)

# Lê o XLSX
df_xlsx = pd.read_excel(caminho_xlsx, dtype=str)

# Garante que os campos de comparação estão em formato string e removem espaços
df_csv['number'] = df_csv['number'].astype(str).str.strip()
df_xlsx['Telefone_Socio'] = df_xlsx['Telefone_Socio'].astype(str).str.strip()

# Cria um dicionário para mapeamento rápido: número -> (operadora, datahora)
mapeamento = df_csv.set_index('number')[['operadora', 'datahora']].to_dict(orient='index')

# Funções para atualizar as colunas no XLSX com base no dicionário
def atualizar_operadora(numero):
    return mapeamento[numero]['operadora'] if numero in mapeamento else None

def atualizar_data(numero):
    return mapeamento[numero]['datahora'] if numero in mapeamento else None

# Atualiza os campos no XLSX
df_xlsx['OPERADORA'] = df_xlsx['Telefone_Socio'].apply(atualizar_operadora)
df_xlsx['DATA ATIVAÇÃO'] = df_xlsx['Telefone_Socio'].apply(atualizar_data)

# Salva o resultado
df_xlsx.to_excel(caminho_saida, index=False)

print("Arquivo atualizado salvo em:", caminho_saida)

