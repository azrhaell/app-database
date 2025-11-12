import pandas as pd
import os

def concatenar_telefone_em_pasta_csv(caminho_da_pasta):
    """
    Lê todos os arquivos CSV em uma pasta, cria uma nova coluna
    'Telefone_Socio' concatenando 'DDD' e 'TEL', e salva
    o resultado em um NOVO arquivo com sufixo '_com_telefone'.

    Args:
        caminho_da_pasta (str): O caminho absoluto para a pasta
                                contendo os arquivos .csv.
    """
    print(f"--- Iniciando processamento na pasta: {caminho_da_pasta} ---")
    
    # Lista todos os arquivos no diretório
    try:
        arquivos = os.listdir(caminho_da_pasta)
    except FileNotFoundError:
        print(f"[ERRO] A pasta especificada não foi encontrada: {caminho_da_pasta}")
        return
    except Exception as e:
        print(f"[ERRO] Não foi possível listar os arquivos: {e}")
        return

    # Filtra apenas os arquivos .csv
    arquivos_csv = [f for f in arquivos if f.endswith('.csv')]

    if not arquivos_csv:
        print("[AVISO] Nenhum arquivo .csv foi encontrado na pasta.")
        return

    print(f"Encontrados {len(arquivos_csv)} arquivos .csv para processar...")

    sucesso_count = 0
    falha_count = 0

    # Itera sobre cada arquivo .csv
    for filename in arquivos_csv:
        
        # --- MUDANÇA: Verifica se é um arquivo já processado ---
        if filename.endswith('_com_telefone.csv'):
            print(f"\nPulando arquivo já processado: {filename}")
            continue
        # --- FIM DA MUDANÇA ---
        
        caminho_completo = os.path.join(caminho_da_pasta, filename)
        print(f"\nProcessando arquivo: {filename}")

        try:
            # --- LEITURA (MODIFICADA PARA TRATAR ENCODING) ---
            try:
                # 1. Tenta ler como UTF-8
                df = pd.read_csv(
                    caminho_completo, 
                    dtype=str, 
                    sep=';', 
                    encoding='utf-8',
                    on_bad_lines='skip' # Ignora linhas mal formatadas se houver
                )
            except UnicodeDecodeError:
                # 2. Se falhar, tenta ler como latin-1 (comum no Brasil/Windows)
                print(f"  [INFO] Falha no UTF-8. Tentando ler como 'latin-1'...")
                df = pd.read_csv(
                    caminho_completo, 
                    dtype=str, 
                    sep=';', 
                    encoding='latin-1',
                    on_bad_lines='skip'
                )
            # --- FIM DA MODIFICAÇÃO DE LEITURA ---

            # --- VERIFICAÇÃO ---
            df.columns = df.columns.str.strip().str.upper()
            
            if 'DDD' not in df.columns or 'TEL' not in df.columns:
                print(f"  [AVISO] Arquivo pulado. Colunas 'DDD' ou 'TEL' não encontradas.")
                print(f"    Colunas encontradas: {list(df.columns)}")
                falha_count += 1
                continue

            # --- TRANSFORMAÇÃO ---
            df['Telefone_Socio'] = df['DDD'].fillna('') + df['TEL'].fillna('')

            # --- SALVAMENTO (MODIFICADO) ---
            # Cria o novo nome de arquivo
            nome_base, extensao = os.path.splitext(filename)
            novo_nome = f"{nome_base}_com_telefone{extensao}"
            caminho_saida = os.path.join(caminho_da_pasta, novo_nome)

            # Salva o novo arquivo
            df.to_csv(caminho_saida, index=False, sep=';', encoding='utf-8')

            print(f"  [SUCESSO] Novo arquivo salvo como: {novo_nome}")
            sucesso_count += 1

        except pd.errors.EmptyDataError:
             print(f"  [AVISO] Arquivo {filename} está vazio. Pulando.")
             falha_count += 1
        except Exception as e:
            print(f"  [ERRO] Falha ao processar o arquivo {filename}. Motivo: {e}")
            falha_count += 1

    # --- CONCLUSÃO ---
    print("\n--- Processamento Concluído ---")
    print(f"Novos arquivos criados com sucesso: {sucesso_count}")
    print(f"Arquivos com falha ou pulados:    {falha_count}")

# --- Exemplo de uso ---
# ATENÇÃO: Use 'r' antes do caminho para evitar problemas com barras invertidas (\)
# Substitua pelo caminho da sua pasta
caminho_da_minha_pasta = r"C:\Users\marce\OneDrive\Área de Trabalho\CLARO\03-BASE_JA_FILTRADA\B2C"

# Chama a função para executar a operação
concatenar_telefone_em_pasta_csv(caminho_da_minha_pasta)