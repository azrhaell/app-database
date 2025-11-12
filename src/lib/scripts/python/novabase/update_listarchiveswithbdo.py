import pandas as pd
import os
from pathlib import Path

# Caminhos dos arquivos
caminho_csv = r'D:\BDO\bdo_filtrado_RJ_ES.csv'
caminho_xlsx = r'C:\Users\marce\OneDrive\Área de Trabalho\CLARO\03-BASE_JA_FILTRADA\B2C'
caminho_saida = r'C:\Users\marce\OneDrive\Área de Trabalho\CLARO\03-BASE_JA_FILTRADA\B2C\PROCESSADOS'

print("="*80)
print("ATUALIZADOR EM LOTE - OPERADORA E DATA ATIVACAO")
print("="*80)
print(f"\nArquivo CSV de referencia: {caminho_csv}")
print(f"Pasta com arquivos CSV: {caminho_xlsx}")
print(f"Pasta de saida: {caminho_saida}\n")

# Cria a pasta de saída se não existir
if not os.path.exists(caminho_saida):
    os.makedirs(caminho_saida)
    print(f"[INFO] Pasta de saida criada: {caminho_saida}\n")

# Lê o CSV uma única vez (para uso em todos os arquivos)
print("Carregando arquivo CSV de referencia...")
try:
    # CSV usa vírgula como delimitador
    df_csv = pd.read_csv(caminho_csv, dtype=str, sep=',', encoding='utf-8')
    print(f"[OK] CSV carregado: {len(df_csv)} registros")
    print(f"Colunas encontradas no CSV: {list(df_csv.columns)}\n")
except Exception as e:
    print(f"[ERRO] Nao foi possivel ler o CSV: {e}")
    exit(1)

# Verifica se as colunas necessárias existem
colunas_necessarias = ['number', 'operadora', 'datahora']
colunas_faltando = [col for col in colunas_necessarias if col not in df_csv.columns]

if colunas_faltando:
    print(f"[ERRO] Colunas nao encontradas no CSV: {colunas_faltando}")
    print(f"Colunas disponiveis: {list(df_csv.columns)}")
    print("\nPor favor, verifique os nomes das colunas no arquivo CSV.")
    exit(1)

# Garante que os campos de comparação estão em formato string e remove espaços
df_csv['number'] = df_csv['number'].astype(str).str.strip()

# Cria um dicionário para mapeamento rápido: número -> (operadora, datahora)
print("Criando dicionario de mapeamento...")
mapeamento = df_csv.set_index('number')[['operadora', 'datahora']].to_dict(orient='index')
print(f"[OK] Dicionario criado com {len(mapeamento)} telefones\n")

# Lista todos os arquivos CSV na pasta
arquivos_csv_processar = [f for f in os.listdir(caminho_xlsx) 
                          if f.lower().endswith('.csv') and 
                          os.path.isfile(os.path.join(caminho_xlsx, f))]

if not arquivos_csv_processar:
    print(f"[AVISO] Nenhum arquivo CSV encontrado na pasta: {caminho_xlsx}")
    exit(0)

print(f"Encontrados {len(arquivos_csv_processar)} arquivo(s) CSV para processar\n")
print("="*80)

# Funções para atualizar as colunas no XLSX com base no dicionário
def atualizar_operadora(numero):
    return mapeamento[numero]['operadora'] if numero in mapeamento else None

def atualizar_data(numero):
    return mapeamento[numero]['datahora'] if numero in mapeamento else None

# Contadores
total_processados = 0
total_atualizados = 0
total_erros = 0

# Processa cada arquivo CSV
for i, nome_arquivo in enumerate(arquivos_csv_processar, 1):
    caminho_entrada = os.path.join(caminho_xlsx, nome_arquivo)
    caminho_arquivo_saida = os.path.join(caminho_saida, nome_arquivo)
    
    print(f"\n[{i}/{len(arquivos_csv_processar)}] Processando: {nome_arquivo}")
    
    try:
        # Lê o CSV (detecta o delimitador automaticamente)
        # Primeiro tenta com ponto e vírgula
        try:
            df_processar = pd.read_csv(caminho_entrada, dtype=str, sep=';', encoding='utf-8')
            if len(df_processar.columns) == 1:
                # Se só tem 1 coluna, provavelmente o delimitador está errado
                df_processar = pd.read_csv(caminho_entrada, dtype=str, sep=',', encoding='utf-8')
        except:
            df_processar = pd.read_csv(caminho_entrada, dtype=str, sep=',', encoding='utf-8')
            
        total_linhas = len(df_processar)
        print(f"  -> {total_linhas} registros encontrados")
        
        # Verifica se a coluna Telefone_Socio existe
        if 'Telefone_Socio' not in df_processar.columns:
            print(f"  [AVISO] Coluna 'Telefone_Socio' nao encontrada.")
            print(f"  Colunas disponiveis: {list(df_processar.columns)}")
            print(f"  Pulando arquivo.")
            total_erros += 1
            continue
        
        # Garante que os campos de comparação estão em formato string e remove espaços
        df_processar['Telefone_Socio'] = df_processar['Telefone_Socio'].astype(str).str.strip()
        
        # Atualiza os campos no CSV
        df_processar['OPERADORA'] = df_processar['Telefone_Socio'].apply(atualizar_operadora)
        df_processar['DATA ATIVACAO'] = df_processar['Telefone_Socio'].apply(atualizar_data)
        
        # Conta quantos registros foram atualizados
        registros_atualizados = df_processar['OPERADORA'].notna().sum()
        
        # Salva o resultado (mantém o delimitador ponto e vírgula)
        df_processar.to_csv(caminho_arquivo_saida, index=False, sep=';', encoding='utf-8')
        
        print(f"  [OK] {registros_atualizados} registros atualizados")
        print(f"  [OK] Arquivo salvo: {nome_arquivo}")
        
        total_processados += 1
        total_atualizados += registros_atualizados
        
    except Exception as e:
        print(f"  [ERRO] Erro ao processar arquivo: {str(e)}")
        import traceback
        traceback.print_exc()
        total_erros += 1

# Relatório final
print("\n" + "="*80)
print("RELATORIO FINAL")
print("="*80)
print(f"\nArquivos processados com sucesso: {total_processados}")
print(f"Arquivos com erro: {total_erros}")
print(f"Total de registros atualizados: {total_atualizados:,}")
print(f"\nArquivos salvos em: {caminho_saida}")
print("\n" + "="*80)