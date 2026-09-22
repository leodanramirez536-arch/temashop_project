// ======================================
// ALMACENAMIENTO SEGURO - STORAGE UTIL
// ======================================
// Credenciales desde variables de entorno

export interface AdminUser {
  email: string;
    name: string;
    }

    export const DEFAULT_ADMIN: AdminUser = {
      email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@temashop.local',
        name: 'Administrador',
        };

        export const DEFAULT_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'TemashopAdmin2024';

        const USERS_STORAGE_KEY = 'temashop_users';
        const PRODUCTS_STORAGE_KEY = 'temashop_products';
        const ORDERS_STORAGE_KEY = 'temashop_orders';

        export interface User {
          id: string;
            name: string;
              email: string;
                password: string;
                  isAdmin: boolean;
                    createdAt: string;
                    }

                    export interface AuthResult {
                      success: boolean;
                        user?: User | null;
                          error?: string;
                          }

                          export function authenticateUser(email: string, password: string): AuthResult {
                            if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN_PASSWORD) {
                                return {
                                      success: true,
                                            user: {
                                                    id: 'admin-001',
                                                            name: DEFAULT_ADMIN.name,
                                                                    email: DEFAULT_ADMIN.email,
                                                                            password: DEFAULT_ADMIN_PASSWORD,
                                                                                    isAdmin: true,
                                                                                            createdAt: new Date().toISOString(),
                                                                                                  },
                                                                                                      };
                                                                                                        }
                                                                                                        
                                                                                                          const users = getAllUsers();
                                                                                                            const user = users.find((u) => u.email === email && u.password === password);
                                                                                                            
                                                                                                              if (user) {
                                                                                                                  return {
                                                                                                                        success: true,
                                                                                                                              user: {
                                                                                                                                      ...user,
                                                                                                                                              password: '',
                                                                                                                                                    },
                                                                                                                                                        };
                                                                                                                                                          }
                                                                                                                                                          
                                                                                                                                                            return {
                                                                                                                                                                success: false,
                                                                                                                                                                    error: 'Email o contraseña incorrectos.',
                                                                                                                                                                      };
                                                                                                                                                                      }
                                                                                                                                                                      
                                                                                                                                                                      export function registerUser(name: string, email: string, password: string): AuthResult {
                                                                                                                                                                        const users = getAllUsers();
                                                                                                                                                                        
                                                                                                                                                                          if (users.some((u) => u.email === email)) {
                                                                                                                                                                              return {
                                                                                                                                                                                    success: false,
                                                                                                                                                                                          error: 'Este email ya está registrado.',
                                                                                                                                                                                              };
                                                                                                                                                                                                }
                                                                                                                                                                                                
                                                                                                                                                                                                  const newUser: User = {
                                                                                                                                                                                                      id: `user-${Date.now()}`,
                                                                                                                                                                                                          name,
                                                                                                                                                                                                              email,
                                                                                                                                                                                                                  password,
                                                                                                                                                                                                                      isAdmin: false,
                                                                                                                                                                                                                          createdAt: new Date().toISOString(),
                                                                                                                                                                                                                            };
                                                                                                                                                                                                                            
                                                                                                                                                                                                                              users.push(newUser);
                                                                                                                                                                                                                                localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
                                                                                                                                                                                                                                
                                                                                                                                                                                                                                  return {
                                                                                                                                                                                                                                      success: true,
                                                                                                                                                                                                                                          user: {
                                                                                                                                                                                                                                                ...newUser,
                                                                                                                                                                                                                                                      password: '',
                                                                                                                                                                                                                                                          },
                                                                                                                                                                                                                                                            };
                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                            export function getAllUsers(): User[] {
                                                                                                                                                                                                                                                              try {
                                                                                                                                                                                                                                                                  const stored = localStorage.getItem(USERS_STORAGE_KEY);
                                                                                                                                                                                                                                                                      return stored ? JSON.parse(stored) : [];
                                                                                                                                                                                                                                                                        } catch (error) {
                                                                                                                                                                                                                                                                            console.error('Error al recuperar usuarios:', error);
                                                                                                                                                                                                                                                                                return [];
                                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                                  }
