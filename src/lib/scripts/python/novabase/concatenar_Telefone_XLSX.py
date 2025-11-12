import pandas as pd
import os

def concatenar_telefone_em_pasta(caminho_da_pasta):
    """
    Lê todos os arquivos XLSX em uma pasta e, em cada um, cria uma
    nova coluna 'Telefone_Socio' concatenando as colunas 'DDD' e 'TEL'.

    Args:
        caminho_da_pasta (str): O caminho absoluto para a pasta
                                contendo os arquivos .xlsx.
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

    # Filtra apenas os arquivos .xlsx
    arquivos_xlsx = [f for f in arquivos if f.endswith('.xlsx')]

    if not arquivos_xlsx:
        print("[AVISO] Nenhum arquivo .xlsx foi encontrado na pasta.")
        return

    print(f"Encontrados {len(arquivos_xlsx)} arquivos .xlsx para processar...")

    sucesso_count = 0
    falha_count = 0

    # Itera sobre cada arquivo .xlsx
    for filename in arquivos_xlsx:
        caminho_completo = os.path.join(caminho_da_pasta, filename)
        print(f"\nProcessando arquivo: {filename}")

        try:
            # --- LEITURA ---
            # Força a leitura de todas as colunas como string (texto)
            # Isso evita problemas de formatação com DDD e TEL
            df = pd.read_excel(caminho_completo, dtype=str)

            # --- VERIFICAÇÃO ---
            if 'DDD' not in df.columns or 'TEL' not in df.columns:
                print(f"  [AVISO] Arquivo pulado. Colunas 'DDD' ou 'TEL' não encontradas.")
                falha_count += 1
                continue

            # --- TRANSFORMAÇÃO ---
            # Preenche valores nulos (NaN) com string vazia ('')
            # Concatena as colunas
            df['Telefone_Socio'] = df['DDD'].fillna('') + df['TEL'].fillna('')

            # --- SALVAMENTO ---
            # Salva o arquivo de volta no mesmo local (sobrescreve)
            # index=False evita que o pandas crie uma coluna "Unnamed: 0"
            df.to_excel(caminho_completo, index=False)

            print(f"  [SUCESSO] Coluna 'Telefone_Socio' adicionada e arquivo salvo.")
            sucesso_count += 1

        except Exception as e:
            print(f"  [ERRO] Falha ao processar o arquivo {filename}. Motivo: {e}")
            falha_count += 1

    # --- CONCLUSÃO ---
    print("\n--- Processamento Concluído ---")
    print(f"Arquivos processados com sucesso: {sucesso_count}")
    print(f"Arquivos com falha ou pulados:   {falha_count}")

# --- Exemplo de uso ---
# ATENÇÃO: Use 'r' antes do caminho para evitar problemas com barras invertidas (\)
# Substitua pelo caminho da sua pasta
caminho_da_minha_pasta = r"C:\Users\marce\OneDrive\Área de Trabalho\CLARO\03-BASE_JA_FILTRADA\PJ"

# Chama a função para executar a operação
concatenar_telefone_em_pasta(caminho_da_minha_pasta)