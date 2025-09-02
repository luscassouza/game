export interface ContaUsuario {
  email: string;
  password: string;
  fullName: string;
  saldoUsuario: number;

} 

// Interface para tipar a transaction do Supabase
export interface Transaction {
  id?: number; // ID auto-incrementado do Supabase (opcional)
  user_id: string; // ID do usuário
  external_id: string; // ID externo do gateway de pagamento
  amount: number; // Valor da transação
  status: string; // Status da transação (ex: "pending", "paid", etc.)
  created_at?: string; // Timestamp de criação (opcional, gerenciado pelo Supabase)
}