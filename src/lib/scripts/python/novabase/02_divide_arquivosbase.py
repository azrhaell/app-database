import os
import csv

# Constantes
PASTA_BASE = r"C:\Users\marce\OneDrive\Área de Trabalho\CLARO"
PASTA_SAIDA = r"C:\Users\marce\OneDrive\Área de Trabalho\CLARO\Arquivos_Filtrados"
MAX_REGISTROS_POR_ARQUIVO = 500000

# Cabeçalho esperado
COLUNAS_ESPERADAS = [
    "DDD","TEL","DOC","NOME","TP_LOG","LOGRAD","NUMERO","COMPLEM","BAIRRO","CIDADE","UF","CEP","INST","TDOC","OPERADORA", "TIPO"
]

class GerenciadorArquivos:
    """Gerencia a criação de múltiplos arquivos quando atinge o limite de registros"""
    
    def __init__(self, nome_base, pasta_saida, cabecalho, max_registros):
        self.nome_base = nome_base
        self.pasta_saida = pasta_saida
        self.cabecalho = cabecalho
        self.max_registros = max_registros
        self.arquivo_atual = None
        self.arquivo_numero = 1
        self.registros_no_arquivo = 0
        self.total_registros = 0
        
        # Cria a pasta de saída se não existir
        if not os.path.exists(self.pasta_saida):
            os.makedirs(self.pasta_saida)
    
    def _criar_novo_arquivo(self):
        """Cria um novo arquivo e escreve o cabeçalho"""
        if self.arquivo_atual:
            self.arquivo_atual.close()
        
        nome_arquivo = f"{self.nome_base}_{self.arquivo_numero}.csv"
        caminho_completo = os.path.join(self.pasta_saida, nome_arquivo)
        
        self.arquivo_atual = open(caminho_completo, 'w', encoding='utf-8', newline='')
        self.arquivo_atual.write(';'.join(self.cabecalho) + '\n')
        self.registros_no_arquivo = 0
        
        print(f"  [NOVO ARQUIVO] Criado: {nome_arquivo}")
        
        return nome_arquivo
    
    def adicionar_registro(self, linha):
        """Adiciona um registro, criando novo arquivo se necessário"""
        if self.arquivo_atual is None or self.registros_no_arquivo >= self.max_registros:
            self._criar_novo_arquivo()
            self.arquivo_numero += 1
        
        self.arquivo_atual.write(linha)
        self.registros_no_arquivo += 1
        self.total_registros += 1
    
    def fechar(self):
        """Fecha o arquivo atual"""
        if self.arquivo_atual:
            self.arquivo_atual.close()
            self.arquivo_atual = None
    
    def get_total_arquivos(self):
        """Retorna o número total de arquivos criados"""
        return self.arquivo_numero - 1 if self.total_registros > 0 else 0

def filtrar_e_dividir_arquivos():
    """
    Filtra registros por UF e TIPO, e divide em arquivos separados.
    """
    # Verifica se a pasta existe
    if not os.path.exists(PASTA_BASE):
        print(f"ERRO: A pasta '{PASTA_BASE}' nao existe!")
        return [], 0, 0, None, None
    
    # Lista todos os arquivos CSV na pasta, excluindo a pasta de saída
    arquivos_csv = [f for f in os.listdir(PASTA_BASE) 
                    if f.lower().endswith('.csv') and 
                    os.path.isfile(os.path.join(PASTA_BASE, f))]
    
    if not arquivos_csv:
        print(f"Nenhum arquivo CSV encontrado na pasta '{PASTA_BASE}'")
        return [], 0, 0, None, None
    
    print(f"Encontrados {len(arquivos_csv)} arquivo(s) CSV na pasta.\n")
    
    # Inicializa gerenciadores de arquivos
    gerenciador_pj = GerenciadorArquivos(
        "BASE_CLARO_PJ", 
        PASTA_SAIDA, 
        COLUNAS_ESPERADAS, 
        MAX_REGISTROS_POR_ARQUIVO
    )
    
    gerenciador_b2c = GerenciadorArquivos(
        "BASE_CLARO_B2C", 
        PASTA_SAIDA, 
        COLUNAS_ESPERADAS, 
        MAX_REGISTROS_POR_ARQUIVO
    )
    
    # Contadores globais
    total_pj_filtrado = 0
    total_b2c_filtrado = 0
    resultados_por_arquivo = []
    
    # UFs válidas
    ufs_validas = {'RJ', 'ES'}
    
    # Processa cada arquivo
    for nome_arquivo in arquivos_csv:
        caminho_completo = os.path.join(PASTA_BASE, nome_arquivo)
        print(f"Processando: {nome_arquivo}")
        
        try:
            # Contadores por arquivo
            pj_count = 0
            b2c_count = 0
            total_linhas = 0
            linhas_ignoradas = 0
            
            # Lê o arquivo
            with open(caminho_completo, 'r', encoding='utf-8', errors='ignore') as arquivo:
                linhas = arquivo.readlines()
            
            if not linhas:
                print(f"  [AVISO] Arquivo vazio\n")
                continue
            
            # Separa cabeçalho e dados
            cabecalho_linha = linhas[0].strip().split(';')
            # Remove aspas do cabeçalho
            cabecalho = [col.strip().strip('"').strip() for col in cabecalho_linha]
            dados = linhas[1:]
            
            print(f"  Cabecalho encontrado: {cabecalho}")
            print(f"  Total de linhas de dados: {len(dados)}")
            
            # Verifica se as colunas necessárias existem
            try:
                idx_uf = cabecalho.index("UF")
                idx_tipo = cabecalho.index("TIPO")
                print(f"  Indices - UF: {idx_uf}, TIPO: {idx_tipo}")
            except ValueError as e:
                print(f"  [ERRO] Coluna necessaria nao encontrada: {e}")
                print(f"  Colunas disponiveis: {', '.join(cabecalho)}\n")
                continue
            
            # Processa cada linha de dados
            for i, linha in enumerate(dados):
                if not linha.strip():
                    continue
                
                total_linhas += 1
                colunas = linha.strip().split(';')
                
                # Debug: mostra algumas linhas para análise
                if i < 3:
                    uf_debug = colunas[idx_uf].strip().strip('"').strip() if idx_uf < len(colunas) else 'N/A'
                    tipo_debug = colunas[idx_tipo].strip().strip('"').strip() if idx_tipo < len(colunas) else 'N/A'
                    print(f"  Linha {i+1} - Colunas: {len(colunas)}")
                    print(f"    UF: '{uf_debug}'")
                    print(f"    TIPO: '{tipo_debug}'")
                
                # Extrai valores das colunas e remove aspas
                uf = colunas[idx_uf].strip().strip('"').strip().upper() if idx_uf < len(colunas) else ""
                tipo = colunas[idx_tipo].strip().strip('"').strip().upper() if idx_tipo < len(colunas) else ""
                
                # Aplica os filtros
                if uf in ufs_validas and tipo in ["PJ", "B2C"]:
                    # Remove aspas de todas as colunas antes de salvar
                    colunas_limpas = [col.strip().strip('"').strip() for col in colunas]
                    
                    # Garante que a linha tenha todas as colunas
                    while len(colunas_limpas) < len(COLUNAS_ESPERADAS):
                        colunas_limpas.append("")
                    
                    linha_formatada = ';'.join(colunas_limpas[:len(COLUNAS_ESPERADAS)]) + '\n'
                    
                    # Adiciona ao arquivo apropriado
                    if tipo == "PJ":
                        gerenciador_pj.adicionar_registro(linha_formatada)
                        pj_count += 1
                    elif tipo == "B2C":
                        gerenciador_b2c.adicionar_registro(linha_formatada)
                        b2c_count += 1
                else:
                    linhas_ignoradas += 1
                    if i < 3:
                        print(f"    -> IGNORADA (UF: {uf in ufs_validas}, TIPO: {tipo in ['PJ', 'B2C']})")
            
            # Atualiza contadores globais
            total_pj_filtrado += pj_count
            total_b2c_filtrado += b2c_count
            
            # Armazena resultado
            resultados_por_arquivo.append({
                'arquivo': nome_arquivo,
                'total_linhas': total_linhas,
                'pj': pj_count,
                'b2c': b2c_count,
                'filtrados': pj_count + b2c_count,
                'ignorados': linhas_ignoradas
            })
            
            print(f"  [OK] Total: {total_linhas} | PJ: {pj_count} | B2C: {b2c_count} | Ignorados: {linhas_ignoradas}\n")
            
        except Exception as e:
            print(f"  [ERRO] Erro ao processar: {str(e)}")
            import traceback
            traceback.print_exc()
            print()
    
    # Fecha todos os arquivos
    gerenciador_pj.fechar()
    gerenciador_b2c.fechar()
    
    return resultados_por_arquivo, total_pj_filtrado, total_b2c_filtrado, gerenciador_pj, gerenciador_b2c

def main():
    """Função principal"""
    print("="*80)
    print("FILTRO E DIVISOR DE ARQUIVOS - BASE CLARO 2024")
    print("="*80)
    print(f"\nPasta de entrada: {PASTA_BASE}")
    print(f"Pasta de saida: {PASTA_SAIDA}")
    print(f"Limite por arquivo: {MAX_REGISTROS_POR_ARQUIVO:,} registros")
    print("\nFiltros aplicados:")
    print("  - UF: RJ ou ES")
    print("  - TIPO: PJ ou B2C")
    print("\n")
    
    resultados, total_pj, total_b2c, ger_pj, ger_b2c = filtrar_e_dividir_arquivos()
    
    # Exibe relatório final
    print("="*80)
    print("RELATORIO FINAL - RESUMO POR ARQUIVO")
    print("="*80)
    
    if resultados:
        print(f"\n{'Arquivo':<40} {'Total':>10} {'PJ':>10} {'B2C':>10} {'Filtrados':>12}")
        print("-"*80)
        
        for resultado in resultados:
            print(f"{resultado['arquivo']:<40} {resultado['total_linhas']:>10} "
                  f"{resultado['pj']:>10} {resultado['b2c']:>10} {resultado['filtrados']:>12}")
        
        print("-"*80)
        total_geral = total_pj + total_b2c
        print(f"{'TOTAL GERAL':<40} {'-':>10} {total_pj:>10} {total_b2c:>10} {total_geral:>12}")
        print("="*80)
        
        # Informações dos arquivos gerados
        print("\nARQUIVOS GERADOS:")
        print("-"*80)
        
        arquivos_pj = ger_pj.get_total_arquivos() if ger_pj else 0
        arquivos_b2c = ger_b2c.get_total_arquivos() if ger_b2c else 0
        
        if arquivos_pj > 0:
            print(f"PJ:  {arquivos_pj} arquivo(s) gerado(s) com {total_pj:,} registros")
            for i in range(1, arquivos_pj + 1):
                if i < arquivos_pj:
                    print(f"     - BASE_CLARO_PJ_{i}.csv: {MAX_REGISTROS_POR_ARQUIVO:,} registros")
                else:
                    registros_ultimo = total_pj - (MAX_REGISTROS_POR_ARQUIVO * (arquivos_pj - 1))
                    print(f"     - BASE_CLARO_PJ_{i}.csv: {registros_ultimo:,} registros")
        else:
            print("PJ:  Nenhum registro filtrado")
        
        print()
        
        if arquivos_b2c > 0:
            print(f"B2C: {arquivos_b2c} arquivo(s) gerado(s) com {total_b2c:,} registros")
            for i in range(1, arquivos_b2c + 1):
                if i < arquivos_b2c:
                    print(f"     - BASE_CLARO_B2C_{i}.csv: {MAX_REGISTROS_POR_ARQUIVO:,} registros")
                else:
                    registros_ultimo = total_b2c - (MAX_REGISTROS_POR_ARQUIVO * (arquivos_b2c - 1))
                    print(f"     - BASE_CLARO_B2C_{i}.csv: {registros_ultimo:,} registros")
        else:
            print("B2C: Nenhum registro filtrado")
        
        print("\n" + "="*80)
        print(f"Arquivos salvos em: {PASTA_SAIDA}")
        
    else:
        print("\nNenhum arquivo foi processado.")
    
    print("\n" + "="*80)

if __name__ == "__main__":
    main()