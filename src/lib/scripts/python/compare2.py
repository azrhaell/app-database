import pandas as pd

# Caminhos dos arquivos
arquivo1 = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\MVE Junho 2025(Export) (1).xlsx'
arquivo2 = r'd:\GitHub\definitiveDATABASE\app-database\public\uploads\MISC\MVE Junho 2025(Export) (2).xlsx'

# Lê os arquivos
df1 = pd.read_excel(arquivo1, dtype=str)
df2 = pd.read_excel(arquivo2, dtype=str)

# Remove espaços e normaliza os nomes das colunas
df1.columns = df1.columns.str.strip().str.upper()
df2.columns = df2.columns.str.strip().str.upper()

# Verifica existência das colunas essenciais
if 'CNPJ' not in df1.columns or 'CNPJ' not in df2.columns:
    raise ValueError("Coluna 'CNPJ' não encontrada em um dos arquivos!")

if 'OBS' not in df2.columns:
    raise ValueError("Coluna 'OBS' não encontrada no segundo arquivo!")

if 'MODO' not in df2.columns:
    raise ValueError("Coluna 'MODO' não encontrada no segundo arquivo!")

# Garante as colunas no df1
if 'OBS' not in df1.columns:
    df1['OBS'] = pd.NA

if 'MODO' not in df1.columns:
    df1['MODO'] = pd.NA

if 'CONTEM_NA_PLANILHA_ANTERIOR' not in df1.columns:
    df1['CONTEM_NA_PLANILHA_ANTERIOR'] = pd.NA

# Remove espaços extras dos CNPJs
df1['CNPJ'] = df1['CNPJ'].str.strip()
df2['CNPJ'] = df2['CNPJ'].str.strip()

# Dicionários de correspondência
obs_dict = dict(zip(df2['CNPJ'], df2['OBS']))
modo_dict = dict(zip(df2['CNPJ'], df2['MODO']))
cnpjs_segundo = set(df2['CNPJ'])

# Preenchimentos
df1['OBS'] = df1['CNPJ'].map(obs_dict).combine_first(df1['OBS'])
df1['MODO'] = df1['CNPJ'].map(modo_dict).combine_first(df1['MODO'])
df1['CONTEM_NA_PLANILHA_ANTERIOR'] = df1['CNPJ'].apply(lambda cnpj: 'SIM' if cnpj in cnpjs_segundo else pd.NA)

# Salva o novo arquivo
output_path = arquivo1.replace('.xlsx', '_atualizado.xlsx')
df1.to_excel(output_path, index=False)

print(f"Arquivo atualizado salvo em: {output_path}")
