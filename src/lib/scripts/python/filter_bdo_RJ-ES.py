#FAZ O FILTRO DO ARQUIVO ORIGINAL DO BDO E SÓ DEIXA OS DDDs QUE SÃO DO RIO DE JANEIRO E ESPIRITO SANTO

import csv

# DDDs desejados
ddd_validos = {'21', '22', '23', '24', '27', '28'}

# Caminho do arquivo CSV de entrada e saída
arquivo_entrada = r'D:\Github\Vivo_Database\app-database\public\BDO\nps.csv'
arquivo_saida =   r'D:\Github\Vivo_Database\app-database\public\BDO\bdo_filtrado_RJ_ES.csv'

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