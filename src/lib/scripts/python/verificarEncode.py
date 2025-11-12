import pandas as pd
import os

def diagnosticar_csvs(caminho_pasta):
    """
    Analisa os arquivos CSV da pasta e mostra as colunas de cada um
    """
    print(f"Analisando arquivos CSV em: {caminho_pasta}\n")
    
    for filename in os.listdir(caminho_pasta):
        if filename.endswith(".csv"):
            caminho_completo = os.path.join(caminho_pasta, filename)
            print(f"=" * 80)
            print(f"Arquivo: {filename}")
            print("=" * 80)
            
            # Tenta diferentes encodings e separadores
            encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
            separadores = [';', ',', '\t', '|']
            
            sucesso = False
            for encoding in encodings:
                for sep in separadores:
                    try:
                        df = pd.read_csv(
                            caminho_completo, 
                            sep=sep, 
                            encoding=encoding,
                            nrows=5,  # Lê apenas as primeiras 5 linhas
                            on_bad_lines='skip'
                        )
                        
                        if len(df.columns) > 1:  # Se conseguiu separar as colunas
                            print(f"\n[OK] Leitura bem-sucedida!")
                            print(f"Encoding: {encoding}")
                            print(f"Separador: '{sep}'")
                            print(f"Total de colunas: {len(df.columns)}")
                            print(f"\nColunas encontradas:")
                            for i, col in enumerate(df.columns, 1):
                                print(f"  {i}. '{col}'")
                            
                            print(f"\nPrimeiras linhas:")
                            print(df.head(2).to_string())
                            
                            sucesso = True
                            break
                    except Exception as e:
                        continue
                
                if sucesso:
                    break
            
            if not sucesso:
                print("[ERRO] Nao foi possivel ler o arquivo com nenhuma combinacao de encoding/separador")
            
            print("\n")

# Caminho da pasta
caminho_pasta = r"d:\Github\Vivo_Database\app-database\public\BRF"

diagnosticar_csvs(caminho_pasta)