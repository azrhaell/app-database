import pandas as pd
import os
import glob
import time

# --- 1. CONFIGURAÇÕES ---

# Caminhos das pastas (use 'r' para strings "raw" e evitar problemas com '\')
PATH_SOURCE = r"C:\Users\marce\OneDrive\Área de Trabalho\CLARO\03-BASE_JA_FILTRADA\PJ"
PATH_REFERENCE = r"d:\Github\Vivo_Database\app-database\public\BRF"

# Pasta de saída para os novos arquivos
PATH_OUTPUT = r"C:\Users\marce\OneDrive\Área de Trabalho\CLARO\04-OUTPUT_BRF"

# Limite de registros por arquivo de saída
MAX_RECORDS_PER_FILE = 500000

# Colunas esperadas nos arquivos de saída (originais + nova)
# Usei exatamente os nomes que você forneceu
SOURCE_COLS_LIST = [
    "DDD","TEL","DOC","NOME","TP_LOG","LOGRAD","NUMERO","COMPLEM","BAIRRO","CIDADE","UF","CEP","INST","TDOC","OPERADORA", "TIPO"
]
OUTPUT_COLS = SOURCE_COLS_LIST + ['SITUACAO_CADASTRAL']

# --- 2. FUNÇÃO AUXILIAR PARA SALVAR CHUNKS ---

def write_chunk(records, base_filename, file_counter, path_output, columns):
    """
    Salva uma lista de registros em um arquivo CSV numerado.
    """
    # Se não há registros, não faz nada
    if not records:
        return file_counter
    
    # Define o nome do arquivo
    filename = os.path.join(path_output, f"{base_filename}_{file_counter}.csv")
    print(f"--- SALVANDO: Escrevendo {len(records)} registros em {filename} ---")
    
    # Converte a lista de dicionários em um DataFrame
    df_chunk = pd.DataFrame(records)
    
    # Garante que todas as colunas existam e estejam na ordem correta
    for col in columns:
        if col not in df_chunk.columns:
            df_chunk[col] = None  # Adiciona coluna vazia se faltar
            
    df_chunk = df_chunk[columns]  # Ordena as colunas
    
    # Salva o arquivo
    # Usamos sep=';' e encoding 'latin1' por ser comum em arquivos BR
    try:
        df_chunk.to_csv(filename, index=False, sep=';', encoding='latin1')
    except Exception as e:
        print(f"ERRO AO SALVAR {filename}: {e}")
        
    return file_counter + 1

# --- 3. SCRIPT PRINCIPAL ---

def main():
    print("Iniciando processo de comparação e filtragem...")
    start_time = time.time()
    
    # Garante que a pasta de saída exista
    os.makedirs(PATH_OUTPUT, exist_ok=True)

    # --- FASE 1: Carregar todos os CNPJs de referência (Pasta 2) ---
    print(f"\nFASE 1: Carregando CNPJs da pasta de referência...\n{PATH_REFERENCE}")
    
    reference_files = glob.glob(os.path.join(PATH_REFERENCE, "*.csv"))
    if not reference_files:
        print(f"ERRO: Nenhum arquivo .csv encontrado em {PATH_REFERENCE}")
        return

    active_cnpjs = set()
    for file in reference_files:
        try:
            # Assume que os arquivos BRF usam ';' como separador
            # Lê apenas a coluna 'CNPJ' como string para economizar memória
            df_ref = pd.read_csv(
                file, 
                sep=';', 
                usecols=['CNPJ'], 
                dtype={'CNPJ': str}, 
                encoding='latin1' # 'latin1' é comum para dados do governo BR
            )
            # Adiciona os CNPJs (sem duplicatas) ao 'set'
            active_cnpjs.update(df_ref['CNPJ'].dropna().unique())
        except Exception as e:
            print(f"Aviso: Falha ao ler o arquivo de referência {file}. Erro: {e}")
            
    if not active_cnpjs:
        print("ERRO: Nenhum CNPJ válido foi carregado. Encerrando.")
        return
        
    print(f"FASE 1 Concluída: {len(active_cnpjs)} CNPJs únicos carregados na memória.")

    # --- FASE 2: Processar arquivos de origem (Pasta 1) ---
    print(f"\nFASE 2: Processando arquivos da pasta de origem...\n{PATH_SOURCE}")
    
    source_files = glob.glob(os.path.join(PATH_SOURCE, "*.csv"))
    if not source_files:
        print(f"ERRO: Nenhum arquivo .csv encontrado em {PATH_SOURCE}")
        return

    # Listas para acumular registros antes de salvar
    pj_records = []
    b2c_records = []

    # Contadores para os nomes dos arquivos de saída
    pj_file_counter = 1
    b2c_file_counter = 1

    # Contadores para o relatório final
    total_pj_filtered = 0
    total_b2c_filtered = 0

    for file in source_files:
        print(f"\nProcessando arquivo: {os.path.basename(file)}...")
        try:
            # NOTA: Assumindo que os arquivos de origem usam ',' como separador.
            # Se falhar, mude para sep=';'
            df_source = pd.read_csv(
                file, 
                sep=',', 
                dtype={'DOCUMENTO': str, 'DDD': str, 'TELEFONE': str},
                encoding='latin1'
            )
            
            # Garante que todas as colunas de origem existam
            for col in SOURCE_COLS_LIST:
                if col not in df_source.columns:
                    print(f"Aviso: Coluna '{col}' não encontrada em {file}. Adicionando como vazia.")
                    df_source[col] = None

        except Exception as e:
            print(f"Erro ao ler {file}: {e}. Tentando com separador ';'")
            try:
                # Tenta novamente com separador ';'
                df_source = pd.read_csv(
                    file, 
                    sep=';', 
                    dtype={'DOCUMENTO': str, 'DDD': str, 'TELEFONE': str},
                    encoding='latin1'
                )
            except Exception as e2:
                print(f"Erro fatal ao ler {file} com ambos separadores: {e2}. Pulando arquivo.")
                continue

        # 1. Adiciona a nova coluna e preenche 'ATIVO'
        # Usamos .apply() para verificar rapidamente cada 'DOCUMENTO' contra o 'set'
        df_source['SITUACAO_CADASTRAL'] = df_source['DOCUMENTO'].apply(
            lambda doc: 'ATIVO' if doc in active_cnpjs else None
        )

        # 2. Filtra apenas os registros 'ATIVO'
        df_ativo = df_source[df_source['SITUACAO_CADASTRAL'] == 'ATIVO'].copy()

        if df_ativo.empty:
            print("Nenhum registro 'ATIVO' encontrado neste arquivo.")
            continue

        # 3. Separa em PJ e B2C
        df_pj = df_ativo[df_ativo['TIPO'] == 'PJ']
        df_b2c = df_ativo[df_ativo['TIPO'] == 'B2C']

        count_pj = len(df_pj)
        count_b2c = len(df_b2c)
        
        # 4. Relatório por arquivo
        print(f"Relatório do Arquivo: {count_pj} registros 'PJ' filtrados.")
        print(f"Relatório do Arquivo: {count_b2c} registros 'B2C' filtrados.")

        total_pj_filtered += count_pj
        total_b2c_filtered += count_b2c

        # 5. Adiciona aos acumuladores e salva se atingir o limite
        if count_pj > 0:
            pj_records.extend(df_pj.to_dict('records'))
        if count_b2c > 0:
            b2c_records.extend(df_b2c.to_dict('records'))

        # Verifica se os acumuladores excederam o limite e salva chunks
        while len(pj_records) >= MAX_RECORDS_PER_FILE:
            chunk_to_write = pj_records[:MAX_RECORDS_PER_FILE]
            pj_records = pj_records[MAX_RECORDS_PER_FILE:]
            pj_file_counter = write_chunk(
                chunk_to_write, 'BASE_CLARO_PJ_BRF', pj_file_counter, PATH_OUTPUT, OUTPUT_COLS
            )

        while len(b2c_records) >= MAX_RECORDS_PER_FILE:
            chunk_to_write = b2c_records[:MAX_RECORDS_PER_FILE]
            b2c_records = b2c_records[MAX_RECORDS_PER_FILE:]
            b2c_file_counter = write_chunk(
                chunk_to_write, 'BASE_CLARO_B2C_BRF', b2c_file_counter, PATH_OUTPUT, OUTPUT_COLS
            )

    # --- FASE 3: Salvar registros restantes ---
    print("\nFASE 3: Processamento de arquivos concluído. Salvando registros restantes...")

    # Salva o que sobrou nas listas
    write_chunk(pj_records, 'BASE_CLARO_PJ_BRF', pj_file_counter, PATH_OUTPUT, OUTPUT_COLS)
    write_chunk(b2c_records, 'BASE_CLARO_B2C_BRF', b2c_file_counter, PATH_OUTPUT, OUTPUT_COLS)

    # --- Relatório Final ---
    end_time = time.time()
    total_time = end_time - start_time

    print("\n--- RELATÓRIO FINAL ---")
    print(f"Total de registros 'PJ' filtrados e salvos: {total_pj_filtered}")
    print(f"Total de registros 'B2C' filtrados e salvos: {total_b2c_filtered}")
    print(f"\nTempo total de execução: {total_time:.2f} segundos.")
    print(f"Arquivos de saída salvos em: {PATH_OUTPUT}")
    print("--- PROCESSO CONCLUÍDO ---")


if __name__ == "__main__":
    # Instala o pandas se não estiver instalado
    try:
        import pandas
    except ImportError:
        print("Instalando a biblioteca 'pandas' necessária...")
        import subprocess
        import sys
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas"])
    
    main()
