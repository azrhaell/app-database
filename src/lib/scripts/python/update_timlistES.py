import pandas as pd

# Caminhos dos arquivos
caminho_csv = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\BDO\bdo_filtrado.csv'
caminho_xlsx = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\ES EMPRESARIO INDIVIDUAL.xlsx'
caminho_saida = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\dados_atualizados_ES EMPRESARIO INDIVIDUAL.xlsx'

# Lê o CSV
df_csv = pd.read_csv(caminho_csv, dtype=str)

# Lê o XLSX
df_xlsx = pd.read_excel(caminho_xlsx, dtype=str)

# Garante que os campos estejam em string e removem espaços
df_csv['number'] = df_csv['number'].astype(str).str.strip()
df_csv['operadora'] = df_csv['operadora'].astype(str).str.strip()
df_csv['datahora'] = df_csv['datahora'].astype(str).str.strip()

df_xlsx['DDD Telefone'] = df_xlsx['DDD Telefone'].astype(str).str.strip()
df_xlsx['Telefone'] = df_xlsx['Telefone'].astype(str).str.strip()

# Adiciona colunas se não existirem
if 'Telefone_Socio' not in df_xlsx.columns:
    df_xlsx['Telefone_Socio'] = ''

if 'Operadora' not in df_xlsx.columns:
    df_xlsx['Operadora'] = ''

if 'Data_Ativacao' not in df_xlsx.columns:
    df_xlsx['Data_Ativacao'] = ''

# Concatena DDD + Telefone → Telefone_Socio
df_xlsx['Telefone_Socio'] = df_xlsx['DDD Telefone'].str.zfill(2) + df_xlsx['Telefone'].str.zfill(8)

# Cria dicionário de mapeamento: number → (operadora, datahora)
mapeamento = df_csv.set_index('number')[['operadora', 'datahora']].to_dict(orient='index')

# Funções para preencher
def atualizar_operadora(numero):
    return mapeamento[numero]['operadora'] if numero in mapeamento else None

def atualizar_data(numero):
    return mapeamento[numero]['datahora'] if numero in mapeamento else None

# Aplica as atualizações no XLSX
df_xlsx['Operadora'] = df_xlsx['Telefone_Socio'].apply(atualizar_operadora)
df_xlsx['Data_Ativacao'] = df_xlsx['Telefone_Socio'].apply(atualizar_data)

# Salva o arquivo resultante
df_xlsx.to_excel(caminho_saida, index=False)

print("Arquivo atualizado salvo em:", caminho_saida)
