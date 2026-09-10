import { TempSessionService } from '../temp/temp_file_sessionService.js';

export class AuthViewModel {
  constructor(dataSource) { this.dataSource = dataSource; }

  async login(username, password) {
    const user = await this.dataSource.login(username.trim(), password);
    TempSessionService.save(user);
    return user;
  }

  logout() { TempSessionService.clear(); }
  currentSession() { return TempSessionService.get(); }
}
