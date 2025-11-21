import csv
import secrets
import string
import re
import unicodedata

def remover_acentos(texto):
    """Remove acentos e caracteres especiais do texto"""
    # Normaliza o texto para decompor os caracteres acentuados
    texto_normalizado = unicodedata.normalize('NFD', texto)
    # Remove os acentos (caracteres de combinação)
    texto_sem_acento = ''.join(char for char in texto_normalizado if unicodedata.category(char) != 'Mn')
    return texto_sem_acento

def validar_email(email):
    """Valida e limpa o email conforme as regras do Microsoft 365"""
    # Remove acentos
    email = remover_acentos(email)
    
    # Remove caracteres não permitidos (mantém apenas letras, números e .-_!#^~)
    email = re.sub(r'[^a-zA-Z0-9.\-_!#^~]', '', email)
    
    # Remove pontos no início e no fim
    email = email.strip('.')
    
    # Limita a 64 caracteres
    if len(email) > 64:
        email = email[:64]
    
    # Remove ponto final se houver após o corte
    email = email.rstrip('.')
    
    return email.lower()

def validar_email_alternativo(email):
    """Valida email alternativo conforme as regras do Microsoft 365"""
    # Remove acentos
    email = remover_acentos(email)
    
    # Remove caracteres não permitidos para email alternativo
    # Permitidos: letras, números e !#$%&'*+-/=?^_`|~.{}
    email = re.sub(r"[^a-zA-Z0-9!#$%&'*+\-/=?^_`|~.{}@]", '', email)
    
    return email

def converter_csv():
    # Configurações
    arquivo_entrada = r"C:\Users\marce\Downloads\tctelecom.csv"
    arquivo_saida = r"C:\Users\marce\Downloads\tctelecom_convertido.csv"
    
    # Dados padrão do endereço
    endereco_padrao = {
        'address': 'Avenida Don Helder Camara, 5644, 10º Andar, Engenho de Dentro',  # Sem acento
        'city': 'Rio de Janeiro',
        'state': 'RJ',
        'country': 'Brasil',
        'postal_code': '20771034'
    }
    
    # Cabeçalho do arquivo de saída - EXATAMENTE 16 colunas
    cabecalho_saida = [
        'User name',
        'First name',
        'Last name',
        'Display name',
        'Job title',
        'Department',
        'Office number',
        'Office phone',
        'Mobile phone',
        'Fax',
        'Alternate email address',
        'Street address',
        'City',
        'State or province',
        'ZIP or postal code',
        'Country or region'
    ]
    
    # Ler arquivo de entrada e processar
    linhas_saida = []
    emails_usados = set()
    
    try:
        with open(arquivo_entrada, 'r', encoding='utf-8') as arquivo_csv:
            leitor = csv.DictReader(arquivo_csv)
            
            contador = 0
            for linha in leitor:
                # Limite de 249 usuários por arquivo
                if contador >= 249:
                    print(f" Aviso: Limite de 249 usuários atingido. Usuários adicionais foram ignorados.")
                    break
                
                email = linha['Email'].strip()
                nome_completo = linha['Nome'].strip()
                tamanho_kb = linha['TamanhoKB'].strip()
                
                # Validar e limpar email
                email_limpo = validar_email(email)
                
                # Verificar se o email é único
                if email_limpo in emails_usados:
                    print(f" Aviso: Email duplicado ignorado - {email_limpo}")
                    continue
                
                # Verificar se o email não está vazio após validação
                if not email_limpo:
                    print(f" Aviso: Email inválido ignorado - {email}")
                    continue
                
                emails_usados.add(email_limpo)
                
                # Extrair primeiro nome e sobrenome do Display Name
                # Remove " - TC Telecom" do final
                nome_limpo = nome_completo.replace(' - TC Telecom', '').strip()
                partes_nome = nome_limpo.split(' ', 1)
                
                primeiro_nome = partes_nome[0] if len(partes_nome) > 0 else ''
                sobrenome = partes_nome[1] if len(partes_nome) > 1 else ''
                
                # Criar email alternativo completo
                email_alternativo = f"{email_limpo}@tcrepresentacao.onmicrosoft.com"
                email_alternativo = validar_email_alternativo(email_alternativo)
                
                # Criar linha de saída - EXATAMENTE na ordem das 16 colunas
                linha_saida = [
                    email_limpo,                        # User name (sem @ e domínio)
                    primeiro_nome,                      # First name
                    sobrenome,                          # Last name
                    nome_completo,                      # Display name
                    '',                                 # Job title
                    '',                                 # Department
                    '',                                 # Office number
                    '',                                 # Office phone
                    '',                                 # Mobile phone
                    '',                                 # Fax
                    email_alternativo,                  # Alternate email address
                    endereco_padrao['address'],         # Street address
                    endereco_padrao['city'],            # City
                    endereco_padrao['state'],           # State or province
                    endereco_padrao['postal_code'],     # ZIP or postal code
                    endereco_padrao['country']          # Country or region
                ]
                
                linhas_saida.append(linha_saida)
                contador += 1
        
        # Escrever arquivo de saída com vírgulas como delimitador
        with open(arquivo_saida, 'w', encoding='utf-8-sig', newline='') as arquivo_csv:
            escritor = csv.writer(arquivo_csv, delimiter=',', quoting=csv.QUOTE_MINIMAL)
            escritor.writerow(cabecalho_saida)
            escritor.writerows(linhas_saida)
        
        print(f" Arquivo convertido com sucesso!")
        print(f" Arquivo de saída: {arquivo_saida}")
        print(f" Total de usuários processados: {len(linhas_saida)}")
        print(f" Formato: 16 colunas delimitadas por vírgula")
        print(f" Limite: {len(linhas_saida)}/249 usuários")
        print("\n Resumo dos usuários:")
        for idx, linha in enumerate(linhas_saida, 1):
            print(f"  {idx}. {linha[3]} - {linha[0]}@tcrepresentacao.onmicrosoft.com")
        
        print("\n Validações aplicadas:")
        print("  - Emails sem acentos (á, ñ, etc.)")
        print("  - Emails sem pontos no início ou fim")
        print("  - Emails limitados a 64 caracteres antes do @")
        print("  - Apenas caracteres válidos: letras, números e .-_!#^~")
        print("  - Emails únicos (sem duplicatas)")
        print("  - Máximo de 249 usuários por arquivo")
        
    except FileNotFoundError:
        print(f"Erro: Arquivo não encontrado em {arquivo_entrada}")
    except Exception as e:
        print(f"Erro ao processar arquivo: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    converter_csv()