import os
import pandas as pd
from pathlib import Path

# Caminhos das pastas
PASTA_PRIMEIRA = r"D:\Github\Nova_Base\Claro_Base\03-BASE_JA_FILTRADA"
PASTA_SEGUNDA = r"C:\Users\marce\OneDrive\Área de Trabalho\CLARO\03-BASE_JA_FILTRADA\B2C\PROCESSADOS"
PASTA_SAIDA = r"C:\Users\marce\OneDrive\Área de Trabalho\CLARO\03-BASE_JA_FILTRADA\B2C\DIFERENCAS"
MAX_REGISTROS_POR_ARQUIVO = 500000

# Mapeamento de colunas
# Primeira pasta usa 'TELEFONE', segunda pasta usa 'Telefone_Socio'
COLUNA_PRIMEIRA = 'TELEFONE'
COLUNA_SEGUNDA = 'Telefone_Socio'

print("="*80)
print("COMPARADOR DE REGISTROS CSV - ENCONTRAR DIFERENCAS")
print("="*80)
print(f"\nPasta 1 (referencia): {PASTA_PRIMEIRA}")
print(f"Pasta 2 (verificar): {PASTA_SEGUNDA}")
print(f"Pasta de saida: {PASTA_SAIDA}")
print(f"Campo de comparacao: {COLUNA_SEGUNDA}")
print(f"Limite por arquivo: {MAX_REGISTROS_POR_ARQUIVO:,} registros\n")

# Verifica se as pastas existem
if not os.path.exists(PASTA_PRIMEIRA):
    print(f"[ERRO] Pasta 1 nao existe: {PASTA_PRIMEIRA}")
    exit(1)

if not os.path.exists(PASTA_SEGUNDA):
    print(f"[ERRO] Pasta 2 nao existe: {PASTA_SEGUNDA}")
    exit(1)

# Cria pasta de saída se não existir
if not os.path.exists(PASTA_SAIDA):
    os.makedirs(PASTA_SAIDA)
    print(f"[INFO] Pasta de saida criada: {PASTA_SAIDA}\n")

# ETAPA 1: Ler todos os documentos da PRIMEIRA pasta
print("="*80)
print("ETAPA 1: Lendo documentos da pasta de referencia (Pasta 1)")
print("="*80)

arquivos_primeira = [f for f in os.listdir(PASTA_PRIMEIRA) 
                     if f.lower().endswith('.csv') and 
                     os.path.isfile(os.path.join(PASTA_PRIMEIRA, f))]

if not arquivos_primeira:
    print(f"[ERRO] Nenhum arquivo CSV encontrado na Pasta 1")
    exit(1)

print(f"Encontrados {len(arquivos_primeira)} arquivo(s) CSV na Pasta 1\n")

documentos_primeira = set()
total_registros_primeira = 0

for i, nome_arquivo in enumerate(arquivos_primeira, 1):
    caminho = os.path.join(PASTA_PRIMEIRA, nome_arquivo)
    print(f"[{i}/{len(arquivos_primeira)}] Lendo: {nome_arquivo}")
    
    try:
        # Tenta ler com ponto e vírgula
        df = pd.read_csv(caminho, dtype=str, sep=';', encoding='utf-8')
        
        # Remove aspas se existirem
        if COLUNA_PRIMEIRA in df.columns:
            # Limpa a coluna
            df[COLUNA_PRIMEIRA] = df[COLUNA_PRIMEIRA].astype(str).str.strip().str.strip('"').str.strip()
            
            # Adiciona ao conjunto (remove duplicatas automaticamente)
            docs = df[COLUNA_PRIMEIRA].dropna().unique()
            documentos_primeira.update(docs)
            total_registros_primeira += len(df)
            
            print(f"  -> {len(df)} registros, {len(docs)} documentos unicos")
        else:
            print(f"  [AVISO] Coluna '{COLUNA_PRIMEIRA}' nao encontrada")
            print(f"  Colunas disponiveis: {list(df.columns)}")
            
    except Exception as e:
        print(f"  [ERRO] Erro ao processar: {str(e)}")

print(f"\n[OK] Total de registros lidos: {total_registros_primeira:,}")
print(f"[OK] Total de documentos unicos na Pasta 1: {len(documentos_primeira):,}\n")

# ETAPA 2: Ler e comparar documentos da SEGUNDA pasta
print("="*80)
print("ETAPA 2: Comparando documentos da Pasta 2 com Pasta 1")
print("="*80)

arquivos_segunda = [f for f in os.listdir(PASTA_SEGUNDA) 
                    if f.lower().endswith('.csv') and 
                    os.path.isfile(os.path.join(PASTA_SEGUNDA, f))]

if not arquivos_segunda:
    print(f"[ERRO] Nenhum arquivo CSV encontrado na Pasta 2")
    exit(1)

print(f"Encontrados {len(arquivos_segunda)} arquivo(s) CSV na Pasta 2\n")

# Lista para armazenar registros não encontrados
registros_nao_encontrados = []
total_registros_segunda = 0
total_nao_encontrados = 0

for i, nome_arquivo in enumerate(arquivos_segunda, 1):
    caminho = os.path.join(PASTA_SEGUNDA, nome_arquivo)
    print(f"[{i}/{len(arquivos_segunda)}] Processando: {nome_arquivo}")
    
    try:
        # Tenta ler com ponto e vírgula
        df = pd.read_csv(caminho, dtype=str, sep=';', encoding='utf-8')
        
        if COLUNA_SEGUNDA not in df.columns:
            print(f"  [AVISO] Coluna '{COLUNA_SEGUNDA}' nao encontrada")
            print(f"  Colunas disponiveis: {list(df.columns)}")
            continue
        
        # Limpa a coluna
        df[COLUNA_SEGUNDA] = df[COLUNA_SEGUNDA].astype(str).str.strip().str.strip('"').str.strip()
        
        total_registros_segunda += len(df)
        
        # Filtra registros NÃO encontrados na primeira pasta
        mask = ~df[COLUNA_SEGUNDA].isin(documentos_primeira)
        nao_encontrados = df[mask]
        
        if len(nao_encontrados) > 0:
            registros_nao_encontrados.append(nao_encontrados)
            total_nao_encontrados += len(nao_encontrados)
            print(f"  -> {len(df)} registros, {len(nao_encontrados)} NAO encontrados na Pasta 1")
        else:
            print(f"  -> {len(df)} registros, todos encontrados na Pasta 1")
            
    except Exception as e:
        print(f"  [ERRO] Erro ao processar: {str(e)}")
        import traceback
        traceback.print_exc()

print(f"\n[OK] Total de registros na Pasta 2: {total_registros_segunda:,}")
print(f"[OK] Total de registros NAO encontrados: {total_nao_encontrados:,}\n")

# ETAPA 3: Salvar registros não encontrados em múltiplos arquivos
if registros_nao_encontrados:
    print("="*80)
    print("ETAPA 3: Salvando registros nao encontrados")
    print("="*80)
    
    # Concatena todos os DataFrames
    df_final = pd.concat(registros_nao_encontrados, ignore_index=True)
    
    # Remove duplicatas baseado no campo
    antes_dedup = len(df_final)
    df_final = df_final.drop_duplicates(subset=[COLUNA_SEGUNDA], keep='first')
    depois_dedup = len(df_final)
    
    print(f"\nRemovendo duplicatas:")
    print(f"  Antes: {antes_dedup:,} registros")
    print(f"  Depois: {depois_dedup:,} registros")
    print(f"  Duplicatas removidas: {antes_dedup - depois_dedup:,}")
    
    # Divide em múltiplos arquivos se necessário
    total_arquivos = (len(df_final) + MAX_REGISTROS_POR_ARQUIVO - 1) // MAX_REGISTROS_POR_ARQUIVO
    
    print(f"\nDividindo em arquivos:")
    print(f"  Total de registros: {len(df_final):,}")
    print(f"  Arquivos a serem criados: {total_arquivos}")
    
    arquivos_salvos = []
    
    for i in range(total_arquivos):
        inicio = i * MAX_REGISTROS_POR_ARQUIVO
        fim = min((i + 1) * MAX_REGISTROS_POR_ARQUIVO, len(df_final))
        
        df_parte = df_final.iloc[inicio:fim]
        
        nome_arquivo = f"REGISTROS_NAO_ENCONTRADOS_{i+1}.csv"
        caminho_arquivo = os.path.join(PASTA_SAIDA, nome_arquivo)
        
        df_parte.to_csv(caminho_arquivo, index=False, sep=';', encoding='utf-8')
        
        arquivos_salvos.append({
            'nome': nome_arquivo,
            'registros': len(df_parte)
        })
        
        print(f"  [{i+1}/{total_arquivos}] {nome_arquivo}: {len(df_parte):,} registros")
    
    print(f"\n[OK] Arquivos salvos com sucesso!")
    print(f"[OK] Local: {PASTA_SAIDA}")
    
else:
    print("="*80)
    print("[INFO] Nenhum registro nao encontrado!")
    print("[INFO] Todos os registros da Pasta 2 existem na Pasta 1")
    print("="*80)
    arquivos_salvos = []

# RELATÓRIO FINAL
print("\n" + "="*80)
print("RELATORIO FINAL")
print("="*80)
print(f"\nPasta 1 (Referencia):")
print(f"  - Arquivos processados: {len(arquivos_primeira)}")
print(f"  - Total de registros: {total_registros_primeira:,}")
print(f"  - Telefones unicos: {len(documentos_primeira):,}")

print(f"\nPasta 2 (Verificacao):")
print(f"  - Arquivos processados: {len(arquivos_segunda)}")
print(f"  - Total de registros: {total_registros_segunda:,}")
print(f"  - Registros NAO encontrados: {total_nao_encontrados:,}")

if registros_nao_encontrados:
    print(f"  - Registros unicos salvos: {len(df_final):,}")
    percentual = (len(df_final) / total_registros_segunda * 100) if total_registros_segunda > 0 else 0
    print(f"  - Percentual nao encontrado: {percentual:.2f}%")
    
    print(f"\nArquivos gerados:")
    for arquivo in arquivos_salvos:
        print(f"  - {arquivo['nome']}: {arquivo['registros']:,} registros")

print("\n" + "="*80)