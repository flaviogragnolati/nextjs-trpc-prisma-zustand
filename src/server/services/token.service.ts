import { HttpClient, type HttpClientT } from '@/utils/httpClient';
import { prisma } from '@/db';

const clientOptions = {
  interceptors: false,
};

/**
 * This is a dummy class to get the token from whatever source you want.
 */
export class TokenService {
  private client: HttpClientT;
  constructor() {
    this.client = new HttpClient(clientOptions);
  }

  async getToken(id: string, from: 'user' | 'account' = 'user') {
    let token = await this.getTokenFromSource(id, from);

    // if token is not found, default to get it from api
    if (!token && from !== 'user') {
      token = await this.getTokenFromSource(id, 'user');
    }

    return token;
  }

  private getTokenFromSource(id: string, from: 'user' | 'account') {
    if (from === 'user') {
      return this.getTokenFromUser(id);
    } else if (from === 'account') {
      return this.getTokenFromAccount(id);
    }

    return null;
  }

  private async getTokenFromUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    return user?.token;
  }

  private async getTokenFromAccount(id: string) {
    const account = await prisma.account.findFirst({ where: { userId: id } });
    return account?.id_token;
  }
}

export const tokenService = new TokenService();
