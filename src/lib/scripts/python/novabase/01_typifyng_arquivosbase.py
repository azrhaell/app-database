import os
import csv

# Constante com o caminho da pasta
PASTA_BASE = r"C:\Users\marce\OneDrive\Área de Trabalho\CLARO"

# Cabeçalho esperado
COLUNAS_ESPERADAS = [
    "DDD","TEL","DOC","NOME","TP_LOG","LOGRAD","NUMERO","COMPLEM","BAIRRO","CIDADE","UF","CEP","INST","TDOC","OPERADORA"
]

def validar_cnpj(cnpj):
    """
    Valida se um número é um CNPJ válido.
    CNPJ tem 14 dígitos.
    """
    # Remove caracteres não numéricos
    cnpj_limpo = ''.join(filter(str.isdigit, str(cnpj)))
    
    # CNPJ deve ter 14 dígitos
    if len(cnpj_limpo) != 14:
        return False
    
    # Verifica se todos os dígitos são iguais (CNPJ inválido)
    if cnpj_limpo == cnpj_limpo[0] * 14:
        return False
    
    # Calcula o primeiro dígito verificador
    soma = 0
    peso = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    for i in range(12):
        soma += int(cnpj_limpo[i]) * peso[i]
    
    resto = soma % 11
    digito1 = 0 if resto < 2 else 11 - resto
    
    if int(cnpj_limpo[12]) != digito1:
        return False
    
    # Calcula o segundo dígito verificador
    soma = 0
    peso = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    for i in range(13):
        soma += int(cnpj_limpo[i]) * peso[i]
    
    resto = soma % 11
    digito2 = 0 if resto < 2 else 11 - resto
    
    if int(cnpj_limpo[13]) != digito2:
        return False
    
    return True

def eh_cnpj(documento):
    """
    Verifica se um documento é um CNPJ.
    Considera CNPJ se tiver 14 dígitos (com ou sem formatação).
    """
    if not documento or str(documento).strip() == "":
        return False
    
    # Remove caracteres não numéricos
    doc_limpo = ''.join(filter(str.isdigit, str(documento)))
    
    # Verifica se tem 14 dígitos (CNPJ) ou 11 dígitos (CPF)
    if len(doc_limpo) == 14:
        # Valida o CNPJ
        return validar_cnpj(doc_limpo)
    
    return False

def classificar_documentos():
    """
    Lê arquivos CSV, classifica documentos como PJ ou B2C e adiciona coluna TIPO.
    """
    # Verifica se a pasta existe
    if not os.path.exists(PASTA_BASE):
        print(f"ERRO: A pasta '{PASTA_BASE}' nao existe!")
        return
    
    # Lista todos os arquivos CSV na pasta
    arquivos_csv = [f for f in os.listdir(PASTA_BASE) if f.lower().endswith('.csv')]
    
    if not arquivos_csv:
        print(f"Nenhum arquivo CSV encontrado na pasta '{PASTA_BASE}'")
        return
    
    print(f"Encontrados {len(arquivos_csv)} arquivo(s) CSV na pasta.\n")
    
    # Contadores globais
    total_pj = 0
    total_b2c = 0
    resultados_por_arquivo = []
    
    # Processa cada arquivo
    for nome_arquivo in arquivos_csv:
        caminho_completo = os.path.join(PASTA_BASE, nome_arquivo)
        print(f"Processando: {nome_arquivo}")
        
        try:
            # Contadores por arquivo
            pj_count = 0
            b2c_count = 0
            
            # Lê o arquivo
            with open(caminho_completo, 'r', encoding='utf-8', errors='ignore') as arquivo:
                linhas = arquivo.readlines()
            
            if not linhas:
                print(f"  [AVISO] Arquivo vazio\n")
                continue
            
            # Separa cabeçalho e dados
            cabecalho_original = linhas[0].strip().split(';')
            dados = linhas[1:]
            
            # Verifica se a coluna DOCUMENTO existe
            try:
                idx_documento = cabecalho_original.index("DOC")
            except ValueError:
                print(f"  [ERRO] Coluna 'DOC' nao encontrada\n")
                continue
            
            # Verifica se a coluna TIPO já existe
            if "TIPO" in cabecalho_original:
                idx_tipo = cabecalho_original.index("TIPO")
                nova_coluna = False
                cabecalho_final = cabecalho_original
            else:
                # Adiciona TIPO ao final do cabeçalho
                cabecalho_final = cabecalho_original + ["TIPO"]
                idx_tipo = len(cabecalho_final) - 1
                nova_coluna = True
            
            # Processa cada linha de dados
            linhas_processadas = [';'.join(cabecalho_final)]
            
            for linha in dados:
                if not linha.strip():
                    continue
                
                colunas = linha.strip().split(';')
                
                # Pega o documento
                documento = colunas[idx_documento] if idx_documento < len(colunas) else ""
                
                # Classifica o documento
                if eh_cnpj(documento):
                    tipo = "PJ"
                    pj_count += 1
                else:
                    tipo = "B2C"
                    b2c_count += 1
                
                # Se é nova coluna, precisa adicionar ao final
                if nova_coluna:
                    # Garante que a linha tem o número correto de colunas originais
                    while len(colunas) < len(cabecalho_original):
                        colunas.append("")
                    # Adiciona o TIPO ao final
                    colunas.append(tipo)
                else:
                    # Atualiza a coluna TIPO existente
                    # Garante que a linha tem o número correto de colunas
                    while len(colunas) <= idx_tipo:
                        colunas.append("")
                    colunas[idx_tipo] = tipo
                
                linhas_processadas.append(';'.join(colunas))
            
            # Salva o arquivo modificado
            with open(caminho_completo, 'w', encoding='utf-8', newline='') as arquivo:
                arquivo.write('\n'.join(linhas_processadas))
            
            # Atualiza contadores globais
            total_pj += pj_count
            total_b2c += b2c_count
            
            # Armazena resultado
            resultados_por_arquivo.append({
                'arquivo': nome_arquivo,
                'pj': pj_count,
                'b2c': b2c_count,
                'total': pj_count + b2c_count
            })
            
            print(f"  [OK] PJ: {pj_count} | B2C: {b2c_count} | Total: {pj_count + b2c_count}\n")
            
        except Exception as e:
            print(f"  [ERRO] Erro ao processar: {str(e)}\n")
    
    return resultados_por_arquivo, total_pj, total_b2c

def main():
    """Função principal"""
    print("="*70)
    print("CLASSIFICADOR DE TIPO PJ/B2C - BASE CLARO 2024")
    print("="*70)
    print(f"\nPasta: {PASTA_BASE}\n")
    
    resultados, total_pj, total_b2c = classificar_documentos()
    
    # Exibe relatório final
    print("="*70)
    print("RELATORIO FINAL - RESUMO POR ARQUIVO")
    print("="*70)
    
    if resultados:
        print(f"\n{'Arquivo':<40} {'PJ':>8} {'B2C':>8} {'Total':>10}")
        print("-"*70)
        
        for resultado in resultados:
            print(f"{resultado['arquivo']:<40} {resultado['pj']:>8} {resultado['b2c']:>8} {resultado['total']:>10}")
        
        print("-"*70)
        print(f"{'TOTAL GERAL':<40} {total_pj:>8} {total_b2c:>8} {total_pj + total_b2c:>10}")
        print("="*70)
        
        # Percentuais
        total_geral = total_pj + total_b2c
        if total_geral > 0:
            perc_pj = (total_pj / total_geral) * 100
            perc_b2c = (total_b2c / total_geral) * 100
            print(f"\nPercentuais: PJ = {perc_pj:.2f}% | B2C = {perc_b2c:.2f}%")
    else:
        print("\nNenhum arquivo foi processado.")
    
    print("\n" + "="*70)

if __name__ == "__main__":
    main()