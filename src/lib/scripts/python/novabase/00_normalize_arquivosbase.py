import os
import csv

# Constante com o caminho da pasta
PASTA_BASE = r"C:\Users\marce\OneDrive\Área de Trabalho\CLARO"

# Cabeçalho esperado
CABECALHO_ESPERADO = [
    "DDD","TEL","DOC","NOME","TP_LOG","LOGRAD","NUMERO","COMPLEM","BAIRRO","CIDADE","UF","CEP","INST","TDOC","OPERADORA"
]

def normalizar_arquivos_csv():
    """
    Lê arquivos CSV de uma pasta e normaliza seus cabeçalhos.
    Retorna lista de arquivos que foram corrigidos.
    """
    arquivos_corrigidos = []
    
    # Verifica se a pasta existe
    if not os.path.exists(PASTA_BASE):
        print(f"ERRO: A pasta '{PASTA_BASE}' não existe!")
        return arquivos_corrigidos
    
    # Lista todos os arquivos CSV na pasta
    arquivos_csv = [f for f in os.listdir(PASTA_BASE) if f.lower().endswith('.csv')]
    
    if not arquivos_csv:
        print(f"Nenhum arquivo CSV encontrado na pasta '{PASTA_BASE}'")
        return arquivos_corrigidos
    
    print(f"Encontrados {len(arquivos_csv)} arquivo(s) CSV na pasta.\n")
    
    # Processa cada arquivo
    for nome_arquivo in arquivos_csv:
        caminho_completo = os.path.join(PASTA_BASE, nome_arquivo)
        print(f"Processando: {nome_arquivo}")
        
        try:
            # Lê o arquivo
            with open(caminho_completo, 'r', encoding='utf-8', errors='ignore') as arquivo:
                conteudo = arquivo.read()
            
            # Separa as linhas
            linhas = conteudo.strip().split('\n')
            
            if not linhas:
                print(f"  [AVISO] Arquivo vazio: {nome_arquivo}\n")
                continue
            
            # Verifica se o cabeçalho está correto
            primeira_linha = linhas[0].strip()
            colunas_primeira_linha = [col.strip() for col in primeira_linha.split(';')]
            
            # Compara o cabeçalho
            cabecalho_correto = (colunas_primeira_linha == CABECALHO_ESPERADO)
            
            if cabecalho_correto:
                print(f"  [OK] Cabecalho correto\n")
            else:
                print(f"  [CORRIGIR] Cabecalho incorreto - Corrigindo...")
                
                # Se a primeira linha não é o cabeçalho, insere o cabeçalho correto
                novo_conteudo = ';'.join(CABECALHO_ESPERADO) + '\n'
                
                # Se a primeira linha parece ser dados (não cabeçalho), mantém todas as linhas
                if len(colunas_primeira_linha) == len(CABECALHO_ESPERADO):
                    # Verifica se a primeira linha parece ser dados (contém ano, documento, etc)
                    if colunas_primeira_linha[0].isdigit():
                        novo_conteudo += '\n'.join(linhas)
                    else:
                        # Primeira linha é cabeçalho incorreto, substitui
                        novo_conteudo += '\n'.join(linhas[1:])
                else:
                    # Adiciona todas as linhas como dados
                    novo_conteudo += '\n'.join(linhas)
                
                # Salva o arquivo corrigido
                with open(caminho_completo, 'w', encoding='utf-8', newline='') as arquivo:
                    arquivo.write(novo_conteudo)
                
                arquivos_corrigidos.append(nome_arquivo)
                print(f"  [OK] Arquivo corrigido e salvo\n")
                
        except Exception as e:
            print(f"  [ERRO] Erro ao processar {nome_arquivo}: {str(e)}\n")
    
    return arquivos_corrigidos

def main():
    """Função principal"""
    print("="*60)
    print("NORMALIZADOR DE ARQUIVOS CSV - BASE CLARO 2024")
    print("="*60)
    print(f"\nPasta: {PASTA_BASE}\n")
    
    arquivos_corrigidos = normalizar_arquivos_csv()
    
    # Resultado final
    print("="*60)
    print("RESULTADO DA NORMALIZAÇÃO")
    print("="*60)
    
    if arquivos_corrigidos:
        print(f"\n[OK] {len(arquivos_corrigidos)} arquivo(s) foram corrigidos:\n")
        for arquivo in arquivos_corrigidos:
            print(f"  - {arquivo}")
    else:
        print("\n[OK] Nenhum arquivo precisou ser corrigido.")
        print("  Todos os arquivos ja possuem o cabecalho correto.")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    main()