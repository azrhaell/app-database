#FAZ O FILTRO DO ARQUIVO ORIGINAL DO BDO E SÓ DEIXA OS DDDs QUE SÃO DO RIO DE JANEIRO E ESPIRITO SANTO

import csv

# DDDs desejados
ddd_validos = {'11', '12', '13', '14', '15', '16', '17', '18', '19'}

# Caminho do arquivo CSV de entrada e saída
arquivo_entrada = r'd:\Github\Vivo_Database\app-database\public\BDO\nps.csv'

arquivo_saida = r'd:\Github\Vivo_Database\app-database\public\BDO\bdo_filtrado_SP.csv'

with open(arquivo_entrada, mode='r', newline='', encoding='utf-8') as infile, \
     open(arquivo_saida, mode='w', newline='', encoding='utf-8') as outfile:
    
    leitor = csv.DictReader(infile)
    campos = leitor.fieldnames
    escritor = csv.DictWriter(outfile, fieldnames=campos)
    
    escritor.writeheader()
    
    for linha in leitor:
        numero = linha['number']
        if numero[:2] in ddd_validos:
            escritor.writerow(linha)
print(f'Arquivo \"{arquivo_saida}\" gerado com sucesso.')