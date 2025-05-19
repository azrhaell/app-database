//import bcrypt from 'bcryptjs';
import * as bcrypt from 'bcryptjs';
import prisma from "../../../app/api/database/dbclient";


async function hashAndUpdatePassword(plainPassword: string, userId: number) {
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  await prisma.users.update({
    where: { idUser: userId },
    data: { password: hashedPassword },
  });
  console.log('Senha atualizada com hash!');
}

// Exemplo de uso: substitua os valores abaixo
const userId = 1; // ID do usuário que deseja atualizar
const plainPassword = '12345678'; // senha em texto puro que o usuário tinha

hashAndUpdatePassword(plainPassword, userId)
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
