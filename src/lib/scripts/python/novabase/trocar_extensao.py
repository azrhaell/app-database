from pathlib import Path

# --- CONFIGURAÇÃO ---
# 1. Altere "caminho/para/sua_pasta" para a pasta real onde estão seus arquivos
PASTA_ALVO = Path(r'C:\Users\marce\OneDrive\Área de Trabalho\CLARO')
# --------------------

# Verifica se a pasta existe
if not PASTA_ALVO.is_dir():
    print(f"Erro: A pasta '{PASTA_ALVO}' não foi encontrada.")
    print("Por favor, verifique o caminho e tente novamente.")
else:
    print(f"Analisando a pasta: {PASTA_ALVO.resolve()}")

    # 2. Encontra todos os arquivos .txt na pasta
    arquivos_txt = list(PASTA_ALVO.glob("*.txt"))

    if not arquivos_txt:
        print("Nenhum arquivo .txt foi encontrado na pasta.")
    else:
        print(f"Encontrados {len(arquivos_txt)} arquivos .txt para renomear:")

        # 3. Itera e renomeia cada arquivo
        for caminho_txt in arquivos_txt:
            try:
                # 4. Cria o novo nome do arquivo trocando a extensão
                caminho_csv = caminho_txt.with_suffix(".csv")
                
                # 5. Renomeia o arquivo
                caminho_txt.rename(caminho_csv)
                print(f"  - RENOMEADO: '{caminho_txt.name}' -> '{caminho_csv.name}'")
                
            except Exception as e:
                print(f"  - ERRO ao renomear '{caminho_txt.name}': {e}")

        print("\nProcesso de renomeação concluído.")