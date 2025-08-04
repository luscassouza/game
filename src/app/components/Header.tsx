
"use client"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContaUsuario } from "@/lib/types";
import { AlertCircle, ArrowRight, Eye, EyeOff, LogIn, LogOut, Plus, Lock, Settings, Shield, User, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import DepositDialog from "./DepositDialog";

export default function Header() {
    const [isDepositoOpen, setIsDepositoOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("register");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registerForm, setRegisterForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: ""
    });
    const [loginForm, setLoginForm] = useState({
        email: "",
        password: ""
    });

    // Estados de erro
    const [registerErrors, setRegisterErrors] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        general: ""
    });
    const [loginErrors, setLoginErrors] = useState({
        email: "",
        password: "",
        general: ""
    });

    const [contaUsuario, setContaUsuario] = useState<ContaUsuario | null>(null);
    const [saldoUsuario, setSaldoUsuario] = useState(0);
    // Carregar conta do localStorage
    useEffect(() => {
        const conta = localStorage.getItem("conta");
        const logado = localStorage.getItem("logado");
        const saldo = localStorage.getItem("saldo");

        if (conta && logado === "true") {
            try {
                const contaParsed = JSON.parse(conta) as ContaUsuario;
                setContaUsuario(contaParsed);

                // Carregar saldo se existir
                if (saldo) {
                    setSaldoUsuario(parseFloat(saldo));
                }
            } catch (error) {
                console.error("Erro ao fazer parse da conta:", error);
            }
        }
    }, []);

    // Função para validar email
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Função para limpar erros
    const clearRegisterErrors = () => {
        setRegisterErrors({
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            fullName: "",
            general: ""
        });
    };

    const clearLoginErrors = () => {
        setLoginErrors({
            email: "",
            password: "",
            general: ""
        });
    };

    // Validação em tempo real do formulário de registro
    const validateRegisterField = (field: string, value: string) => {
        switch (field) {
            case "username":
                if (!value.trim()) {
                    setRegisterErrors(prev => ({ ...prev, username: "Email é obrigatório" }));
                } else if (!validateEmail(value)) {
                    setRegisterErrors(prev => ({ ...prev, username: "Email inválido" }));
                } else {
                    setRegisterErrors(prev => ({ ...prev, username: "" }));
                }
                break;
            case "password":
                if (!value) {
                    setRegisterErrors(prev => ({ ...prev, password: "Senha é obrigatória" }));
                } else if (value.length < 6) {
                    setRegisterErrors(prev => ({ ...prev, password: "Senha deve ter pelo menos 6 caracteres" }));
                } else {
                    setRegisterErrors(prev => ({ ...prev, password: "" }));
                }
                // Validar confirmação de senha também
                if (registerForm.confirmPassword && value !== registerForm.confirmPassword) {
                    setRegisterErrors(prev => ({ ...prev, confirmPassword: "As senhas não coincidem" }));
                } else if (registerForm.confirmPassword) {
                    setRegisterErrors(prev => ({ ...prev, confirmPassword: "" }));
                }
                break;
            case "confirmPassword":
                if (!value) {
                    setRegisterErrors(prev => ({ ...prev, confirmPassword: "Confirmação de senha é obrigatória" }));
                } else if (value !== registerForm.password) {
                    setRegisterErrors(prev => ({ ...prev, confirmPassword: "As senhas não coincidem" }));
                } else {
                    setRegisterErrors(prev => ({ ...prev, confirmPassword: "" }));
                }
                break;
            case "fullName":
                if (!value.trim()) {
                    setRegisterErrors(prev => ({ ...prev, fullName: "Nome completo é obrigatório" }));
                } else {
                    setRegisterErrors(prev => ({ ...prev, fullName: "" }));
                }
                break;
        }
    };

    const handleRegister = () => {
        // Limpar erros gerais
        clearRegisterErrors();

        // Validar todos os campos
        validateRegisterField("username", registerForm.username);
        validateRegisterField("password", registerForm.password);
        validateRegisterField("confirmPassword", registerForm.confirmPassword);
        validateRegisterField("fullName", registerForm.fullName);

        // Verificar se há erros
        const hasErrors = Object.values(registerErrors).some(error => error !== "") ||
            !registerForm.username.trim() ||
            !registerForm.password ||
            !registerForm.confirmPassword ||
            !registerForm.fullName.trim() ||
            !validateEmail(registerForm.username) ||
            registerForm.password.length < 6 ||
            registerForm.password !== registerForm.confirmPassword;

        if (hasErrors) {
            return;
        }

        const novaConta: ContaUsuario = {
            email: registerForm.username, // username é o email
            password: registerForm.password
        };

        localStorage.setItem("conta", JSON.stringify(novaConta));
        setContaUsuario(novaConta);
        setIsRegisterOpen(false);
        setRegisterForm({ username: "", email: "", password: "", confirmPassword: "", fullName: "" });
        clearRegisterErrors();
    };

    const handleLogin = () => {
        clearLoginErrors();

        if (!loginForm.email.trim()) {
            setLoginErrors(prev => ({ ...prev, email: "Email é obrigatório" }));
            return;
        }

        if (!loginForm.password) {
            setLoginErrors(prev => ({ ...prev, password: "Senha é obrigatória" }));
            return;
        }

        const conta = localStorage.getItem("conta");
        if (!conta) {
            setLoginErrors(prev => ({ ...prev, general: "Nenhuma conta encontrada. Faça o cadastro primeiro!" }));
            return;
        }

        try {
            const contaParsed = JSON.parse(conta) as ContaUsuario;

            if (contaParsed.email === loginForm.email && contaParsed.password === loginForm.password) {
                setContaUsuario(contaParsed);
                setIsLoginOpen(false);
                setLoginForm({ email: "", password: "" });
                clearLoginErrors();

                // Adicionar registro de login no localStorage
                localStorage.setItem("logado", "true");

                // Definir saldo inicial se não existir
                const saldoAtual = localStorage.getItem("saldo");
                if (!saldoAtual) {
                    const saldoInicial = 0;
                    localStorage.setItem("saldo", saldoInicial.toString());
                    setSaldoUsuario(saldoInicial);
                } else {
                    setSaldoUsuario(parseFloat(saldoAtual));
                }
            } else {
                setLoginErrors(prev => ({ ...prev, general: "Email ou senha incorretos!" }));
            }
        } catch (error) {
            setLoginErrors(prev => ({ ...prev, general: "Erro ao fazer login!" }));
        }
    };

    const handleLogout = () => {
        setContaUsuario(null);
        // Alterar status de login para false ao invés de remover a conta
        localStorage.setItem("logado", "false");
    };

    const handleOpenLogin = () => {
        setActiveTab("login");
        setIsLoginOpen(true);
    };

    const handleOpenRegister = () => {
        setActiveTab("register");
        setIsRegisterOpen(true);
    };
    return <>
        <header className="border-b border-gray-800 bg-black px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                <div className="flex relative w-[100px] h-[50px] items-center gap-2">
                    <Image
                    className="object-contain"
                        src="/logo.png"
                        alt="logo"
                        fill
                    />
                </div>
                <div className="flex items-center gap-4">
                    {contaUsuario ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-gray-800 px-2 md:px-3 py-1 md:py-2 rounded-lg">
                                <span className="text-green-400 font-bold text-xs md:text-sm">R$</span>
                                <span className="text-white font-bold text-xs md:text-sm">{saldoUsuario.toFixed(2)}</span>
                            </div>
                            <Button
                                className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 h-8 md:h-10 px-2 md:px-4"
                                onClick={() => setIsDepositoOpen(true)}
                            >
                                <Plus className="h-4 w-4 md:hidden" />
                                <ArrowRight className="h-4 w-4 hidden md:block" />
                                <span className="hidden md:inline">Depositar</span>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-6 w-6 md:h-8 md:w-8 rounded-full p-0">
                                        <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-green-500 flex items-center justify-center">
                                            <User className="h-3 w-3 md:h-4 md:w-4 text-white" />
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700">
                                    <div className="px-2 py-1.5">
                                        <p className="text-sm font-medium text-white">{contaUsuario.email}</p>
                                        <p className="text-xs text-gray-400">Saldo: R$ {saldoUsuario.toFixed(2)}</p>
                                    </div>
                                    <DropdownMenuSeparator className="bg-gray-700" />
                                    <DropdownMenuItem className="text-white hover:bg-gray-800 cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        Detalhes da Conta
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-white hover:bg-gray-800 cursor-pointer">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Configurações
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-gray-700" />
                                    <DropdownMenuItem
                                        className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sair
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <>
                            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-1 md:gap-2 text-white hover:text-green-400 text-xs md:text-sm h-8 md:h-10 px-2 md:px-4"
                                        onClick={handleOpenRegister}
                                    >
                                        <UserPlus className="h-3 w-3 md:h-4 md:w-4" />
                                        <span className="hidden md:inline">Cadastrar</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="p-0 min-w-screen md:min-w-[800px] h-auto md:h-[500px] bg-white border-black">
                                    {/* Desktop Layout */}
                                    <div className="hidden md:flex w-full h-full">
                                        {/* Left Side - Promotional Image */}
                                        <div className="flex-1 relative bg-gradient-to-br from-blue-600 to-purple-700">
                                            <Image src="https://megaraspadinha.site/storage/uploads/V4S0XrvzjW6eoB13bXIbgRLo8PCMSNkX7pPO3eWa.jpg" alt="promotion" fill />
                                        </div>

                                        {/* Right Side - Auth Form */}
                                        <div className="flex-1 p-8 bg-black">
                                            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                                <TabsList className="grid w-full grid-cols-2 bg-black">
                                                    <TabsTrigger
                                                        value="register"
                                                        className="data-[state=active]:border-b-green-300 data-[state=active]:bg-black border-2 data-[state=active]:text-white text-gray-300"
                                                    >
                                                        Cadastro
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="login"
                                                        className="data-[state=active]:border-b-green-300 data-[state=active]:bg-black border-2 data-[state=active]:text-white text-gray-300"
                                                    >
                                                        Conecte-se
                                                    </TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="register" className="flex-1 mt-6">
                                                    <div className="h-full flex flex-col">
                                                        <h3 className="text-white text-lg mb-6">Crie sua conta gratuita. Vamos começar?</h3>

                                                        {registerErrors.general && (
                                                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-2">
                                                                <AlertCircle className="h-4 w-4 text-red-400" />
                                                                <span className="text-red-400 text-sm">{registerErrors.general}</span>
                                                            </div>
                                                        )}

                                                        <div className="space-y-4 flex-1">
                                                            <div className="relative">
                                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type="email"
                                                                    placeholder="Email do usuário"
                                                                    value={registerForm.username}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, username: e.target.value });
                                                                        validateRegisterField("username", e.target.value);
                                                                    }}
                                                                    className={`pl-10 bg-zinc-900 border-gray-600 text-white rounded-md ${registerErrors.username ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                {registerErrors.username && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.username}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="Insira sua Senha"
                                                                    value={registerForm.password}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, password: e.target.value });
                                                                        validateRegisterField("password", e.target.value);
                                                                    }}
                                                                    className={`pl-10 pr-10 bg-zinc-900 border-gray-600 text-white rounded-md ${registerErrors.password ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                >
                                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                                {registerErrors.password && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.password}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type={showConfirmPassword ? "text" : "password"}
                                                                    placeholder="Confirmação de Senha"
                                                                    value={registerForm.confirmPassword}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                                                                        validateRegisterField("confirmPassword", e.target.value);
                                                                    }}
                                                                    className={`pl-10 pr-10 bg-zinc-900 border-gray-600 text-white ${registerErrors.confirmPassword ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                >
                                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                                {registerErrors.confirmPassword && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.confirmPassword}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type="text"
                                                                    placeholder="Nome Completo"
                                                                    value={registerForm.fullName}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, fullName: e.target.value });
                                                                        validateRegisterField("fullName", e.target.value);
                                                                    }}
                                                                    className={`pl-10 bg-zinc-900 border-gray-600 text-white ${registerErrors.fullName ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                {registerErrors.fullName && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.fullName}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <Button
                                                            onClick={handleRegister}
                                                            className="w-full bg-green-500 hover:bg-green-600 text-white mt-6"
                                                        >
                                                            Registrar
                                                        </Button>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="login" className="flex-1 mt-6">
                                                    <div className="h-full flex flex-col">
                                                        <h3 className="text-white text-lg mb-6">Entre na sua conta</h3>

                                                        {loginErrors.general && (
                                                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-2">
                                                                <AlertCircle className="h-4 w-4 text-red-400" />
                                                                <span className="text-red-400 text-sm">{loginErrors.general}</span>
                                                            </div>
                                                        )}

                                                        <div className="space-y-4 flex-1">
                                                            <div className="relative">
                                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type="email"
                                                                    placeholder="Seu email"
                                                                    value={loginForm.email}
                                                                    onChange={(e) => {
                                                                        setLoginForm({ ...loginForm, email: e.target.value });
                                                                        if (loginErrors.email) {
                                                                            setLoginErrors(prev => ({ ...prev, email: "" }));
                                                                        }
                                                                    }}
                                                                    className={`pl-10 bg-zinc-900 border-gray-600 text-white ${loginErrors.email ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                {loginErrors.email && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {loginErrors.email}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="Sua senha"
                                                                    value={loginForm.password}
                                                                    onChange={(e) => {
                                                                        setLoginForm({ ...loginForm, password: e.target.value });
                                                                        if (loginErrors.password) {
                                                                            setLoginErrors(prev => ({ ...prev, password: "" }));
                                                                        }
                                                                    }}
                                                                    className="pl-10 pr-10 bg-zinc-900 border-gray-600 text-white"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                >
                                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                                {loginErrors.password && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {loginErrors.password}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <Button
                                                            onClick={handleLogin}
                                                            className="w-full bg-green-500 hover:bg-green-600 text-white mt-6"
                                                        >
                                                            Entrar
                                                        </Button>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    </div>

                                    {/* Mobile Layout */}
                                    <div className="md:hidden w-screen h-full flex flex-col">
                                        {/* Top - Promotional Image */}
                                        <div className="h-20 bg-gradient-to-r from-blue-600 to-purple-700 relative">
                                            <Image src="https://megaraspadinha.site/storage/uploads/scKEZLpDND4PDs1YLvVEK8hrKyApOmOix56uYCdo.png" fill alt="promotion" />
                                        </div>

                                        {/* Bottom - Auth Form */}
                                        <div className="flex-1 p-6 bg-gray-900">
                                            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                                <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-6">
                                                    <TabsTrigger
                                                        value="register"
                                                        className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-gray-300"
                                                    >
                                                        Inscrever-se
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="login"
                                                        className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-gray-300"
                                                    >
                                                        Conecte-se
                                                    </TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="register" className="flex-1">
                                                    <div className="h-full flex flex-col">
                                                        <h3 className="text-white text-lg mb-6">Crie sua conta gratuita. Vamos começar?</h3>

                                                        {registerErrors.general && (
                                                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-2">
                                                                <AlertCircle className="h-4 w-4 text-red-400" />
                                                                <span className="text-red-400 text-sm">{registerErrors.general}</span>
                                                            </div>
                                                        )}

                                                        <div className="space-y-4 flex-1">
                                                            <div className="relative">
                                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type="email"
                                                                    placeholder="Email do usuário"
                                                                    value={registerForm.username}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, username: e.target.value });
                                                                        validateRegisterField("username", e.target.value);
                                                                    }}
                                                                    className={`pl-10 bg-gray-800 border-gray-600 text-white ${registerErrors.username ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                {registerErrors.username && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.username}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="Insira sua Senha"
                                                                    value={registerForm.password}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, password: e.target.value });
                                                                        validateRegisterField("password", e.target.value);
                                                                    }}
                                                                    className={`pl-10 pr-10 bg-gray-800 border-gray-600 text-white ${registerErrors.password ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                >
                                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                                {registerErrors.password && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.password}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type={showConfirmPassword ? "text" : "password"}
                                                                    placeholder="Confirmação de Senha"
                                                                    value={registerForm.confirmPassword}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                                                                        validateRegisterField("confirmPassword", e.target.value);
                                                                    }}
                                                                    className={`pl-10 pr-10 bg-gray-800 border-gray-600 text-white ${registerErrors.confirmPassword ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                >
                                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                                {registerErrors.confirmPassword && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.confirmPassword}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type="text"
                                                                    placeholder="Nome Completo"
                                                                    value={registerForm.fullName}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, fullName: e.target.value });
                                                                        validateRegisterField("fullName", e.target.value);
                                                                    }}
                                                                    className={`pl-10 bg-gray-800 border-gray-600 text-white ${registerErrors.fullName ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                {registerErrors.fullName && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.fullName}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <Button
                                                            onClick={handleRegister}
                                                            className="w-full bg-green-500 hover:bg-green-600 text-white mt-6"
                                                        >
                                                            Registrar
                                                        </Button>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="login" className="flex-1">
                                                    <div className="h-full flex flex-col">
                                                        <h3 className="text-white text-lg mb-6">Entre na sua conta</h3>

                                                        {loginErrors.general && (
                                                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-2">
                                                                <AlertCircle className="h-4 w-4 text-red-400" />
                                                                <span className="text-red-400 text-sm">{loginErrors.general}</span>
                                                            </div>
                                                        )}

                                                        <div className="space-y-4 flex-1">
                                                            <div className="relative">
                                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type="email"
                                                                    placeholder="Seu email"
                                                                    value={loginForm.email}
                                                                    onChange={(e) => {
                                                                        setLoginForm({ ...loginForm, email: e.target.value });
                                                                        if (loginErrors.email) {
                                                                            setLoginErrors(prev => ({ ...prev, email: "" }));
                                                                        }
                                                                    }}
                                                                    className={`pl-10 bg-gray-800 border-gray-600 text-white ${loginErrors.email ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                {loginErrors.email && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {loginErrors.email}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="Sua senha"
                                                                    value={loginForm.password}
                                                                    onChange={(e) => {
                                                                        setLoginForm({ ...loginForm, password: e.target.value });
                                                                        if (loginErrors.password) {
                                                                            setLoginErrors(prev => ({ ...prev, password: "" }));
                                                                        }
                                                                    }}
                                                                    className={`pl-10 pr-10 bg-gray-800 border-gray-600 text-white ${loginErrors.password ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                >
                                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                                {loginErrors.password && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {loginErrors.password}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <Button
                                                            onClick={handleLogin}
                                                            className="w-full bg-green-500 hover:bg-green-600 text-white mt-6"
                                                        >
                                                            Entrar
                                                        </Button>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 md:gap-2 h-8 md:h-10 px-2 md:px-4 text-xs md:text-sm"
                                        onClick={handleOpenLogin}
                                    >
                                        <LogIn className="h-3 w-3 md:h-4 md:w-4" />
                                        <span className="hidden md:inline">Entrar</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="p-0 min-w-screen md:min-w-[800px] h-auto md:h-[500px] bg-white border-black">
                                    {/* Desktop Layout */}
                                    <div className="hidden md:flex w-full h-full">
                                        {/* Left Side - Promotional Image */}
                                        <div className="flex-1 relative bg-gradient-to-br from-blue-600 to-purple-700">
                                            <Image src="https://megaraspadinha.site/storage/uploads/V4S0XrvzjW6eoB13bXIbgRLo8PCMSNkX7pPO3eWa.jpg" alt="promotion" fill />
                                        </div>

                                        {/* Right Side - Auth Form */}
                                        <div className="flex-1 p-8 bg-black">
                                            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                                <TabsList className="grid w-full grid-cols-2 bg-black">
                                                    <TabsTrigger
                                                        value="register"
                                                        className="data-[state=active]:border-b-green-300 data-[state=active]:bg-black border-2 data-[state=active]:text-white text-gray-300"
                                                    >
                                                        Cadastro
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="login"
                                                        className="data-[state=active]:border-b-green-300 data-[state=active]:bg-black border-2 data-[state=active]:text-white text-gray-300"
                                                    >
                                                        Conecte-se
                                                    </TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="register" className="flex-1 mt-6">
                                                    <div className="h-full flex flex-col">
                                                        <h3 className="text-white text-lg mb-6">Crie sua conta gratuita. Vamos começar?</h3>

                                                        {registerErrors.general && (
                                                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-2">
                                                                <AlertCircle className="h-4 w-4 text-red-400" />
                                                                <span className="text-red-400 text-sm">{registerErrors.general}</span>
                                                            </div>
                                                        )}

                                                        <div className="space-y-4 flex-1">
                                                            <div className="relative">
                                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type="email"
                                                                    placeholder="Email do usuário"
                                                                    value={registerForm.username}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, username: e.target.value });
                                                                        validateRegisterField("username", e.target.value);
                                                                    }}
                                                                    className={`pl-10 bg-zinc-900 border-gray-600 text-white rounded-md ${registerErrors.username ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                {registerErrors.username && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.username}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="Insira sua Senha"
                                                                    value={registerForm.password}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, password: e.target.value });
                                                                        validateRegisterField("password", e.target.value);
                                                                    }}
                                                                    className={`pl-10 pr-10 bg-zinc-900 border-gray-600 text-white rounded-md ${registerErrors.password ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                >
                                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                                {registerErrors.password && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.password}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type={showConfirmPassword ? "text" : "password"}
                                                                    placeholder="Confirmação de Senha"
                                                                    value={registerForm.confirmPassword}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                                                                        validateRegisterField("confirmPassword", e.target.value);
                                                                    }}
                                                                    className={`pl-10 pr-10 bg-zinc-900 border-gray-600 text-white ${registerErrors.confirmPassword ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                >
                                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                                {registerErrors.confirmPassword && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.confirmPassword}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type="text"
                                                                    placeholder="Nome Completo"
                                                                    value={registerForm.fullName}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, fullName: e.target.value });
                                                                        validateRegisterField("fullName", e.target.value);
                                                                    }}
                                                                    className={`pl-10 bg-zinc-900 border-gray-600 text-white ${registerErrors.fullName ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                {registerErrors.fullName && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.fullName}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <Button
                                                            onClick={handleRegister}
                                                            className="w-full bg-green-500 hover:bg-green-600 text-white mt-6"
                                                        >
                                                            Registrar
                                                        </Button>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="login" className="flex-1 mt-6">
                                                    <div className="h-full flex flex-col">
                                                        <h3 className="text-white text-lg mb-6">Entre na sua conta</h3>

                                                        {loginErrors.general && (
                                                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-2">
                                                                <AlertCircle className="h-4 w-4 text-red-400" />
                                                                <span className="text-red-400 text-sm">{loginErrors.general}</span>
                                                            </div>
                                                        )}

                                                        <div className="space-y-4 flex-1">
                                                            <div className="relative">
                                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type="email"
                                                                    placeholder="Seu email"
                                                                    value={loginForm.email}
                                                                    onChange={(e) => {
                                                                        setLoginForm({ ...loginForm, email: e.target.value });
                                                                        if (loginErrors.email) {
                                                                            setLoginErrors(prev => ({ ...prev, email: "" }));
                                                                        }
                                                                    }}
                                                                    className={`pl-10 bg-zinc-900 border-gray-600 text-white ${loginErrors.email ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                {loginErrors.email && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {loginErrors.email}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="Sua senha"
                                                                    value={loginForm.password}
                                                                    onChange={(e) => {
                                                                        setLoginForm({ ...loginForm, password: e.target.value });
                                                                        if (loginErrors.password) {
                                                                            setLoginErrors(prev => ({ ...prev, password: "" }));
                                                                        }
                                                                    }}
                                                                    className="pl-10 pr-10 bg-zinc-900 border-gray-600 text-white"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                >
                                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                                {loginErrors.password && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {loginErrors.password}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <Button
                                                            onClick={handleLogin}
                                                            className="w-full bg-green-500 hover:bg-green-600 text-white mt-6"
                                                        >
                                                            Entrar
                                                        </Button>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    </div>

                                    {/* Mobile Layout */}
                                    <div className="md:hidden w-screen h-full flex flex-col">
                                        {/* Top - Promotional Image */}
                                        <div className="h-20 bg-gradient-to-r from-blue-600 to-purple-700 relative">
                                            <Image src="https://megaraspadinha.site/storage/uploads/scKEZLpDND4PDs1YLvVEK8hrKyApOmOix56uYCdo.png" fill alt="promotion" />
                                        </div>

                                        {/* Bottom - Auth Form */}
                                        <div className="flex-1 p-6 bg-gray-900">
                                            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                                <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-6">
                                                    <TabsTrigger
                                                        value="register"
                                                        className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-gray-300"
                                                    >
                                                        Inscrever-se
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="login"
                                                        className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-gray-300"
                                                    >
                                                        Conecte-se
                                                    </TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="register" className="flex-1">
                                                    <div className="h-full flex flex-col">
                                                        <h3 className="text-white text-lg mb-6">Crie sua conta gratuita. Vamos começar?</h3>

                                                        {registerErrors.general && (
                                                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-2">
                                                                <AlertCircle className="h-4 w-4 text-red-400" />
                                                                <span className="text-red-400 text-sm">{registerErrors.general}</span>
                                                            </div>
                                                        )}

                                                        <div className="space-y-4 flex-1">
                                                            <div className="relative">
                                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type="email"
                                                                    placeholder="Email do usuário"
                                                                    value={registerForm.username}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, username: e.target.value });
                                                                        validateRegisterField("username", e.target.value);
                                                                    }}
                                                                    className={`pl-10 bg-gray-800 border-gray-600 text-white ${registerErrors.username ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                {registerErrors.username && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.username}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="Insira sua Senha"
                                                                    value={registerForm.password}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, password: e.target.value });
                                                                        validateRegisterField("password", e.target.value);
                                                                    }}
                                                                    className={`pl-10 pr-10 bg-gray-800 border-gray-600 text-white ${registerErrors.password ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                >
                                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                                {registerErrors.password && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.password}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type={showConfirmPassword ? "text" : "password"}
                                                                    placeholder="Confirmação de Senha"
                                                                    value={registerForm.confirmPassword}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                                                                        validateRegisterField("confirmPassword", e.target.value);
                                                                    }}
                                                                    className={`pl-10 pr-10 bg-gray-800 border-gray-600 text-white ${registerErrors.confirmPassword ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                >
                                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                                {registerErrors.confirmPassword && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.confirmPassword}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type="text"
                                                                    placeholder="Nome Completo"
                                                                    value={registerForm.fullName}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, fullName: e.target.value });
                                                                        validateRegisterField("fullName", e.target.value);
                                                                    }}
                                                                    className={`pl-10 bg-gray-800 border-gray-600 text-white ${registerErrors.fullName ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                {registerErrors.fullName && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.fullName}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <Button
                                                            onClick={handleRegister}
                                                            className="w-full bg-green-500 hover:bg-green-600 text-white mt-6"
                                                        >
                                                            Registrar
                                                        </Button>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="login" className="flex-1">
                                                    <div className="h-full flex flex-col">
                                                        <h3 className="text-white text-lg mb-6">Entre na sua conta</h3>

                                                        {loginErrors.general && (
                                                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-2">
                                                                <AlertCircle className="h-4 w-4 text-red-400" />
                                                                <span className="text-red-400 text-sm">{loginErrors.general}</span>
                                                            </div>
                                                        )}

                                                        <div className="space-y-4 flex-1">
                                                            <div className="relative">
                                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type="email"
                                                                    placeholder="Seu email"
                                                                    value={loginForm.email}
                                                                    onChange={(e) => {
                                                                        setLoginForm({ ...loginForm, email: e.target.value });
                                                                        if (loginErrors.email) {
                                                                            setLoginErrors(prev => ({ ...prev, email: "" }));
                                                                        }
                                                                    }}
                                                                    className={`pl-10 bg-gray-800 border-gray-600 text-white ${loginErrors.email ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                {loginErrors.email && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {loginErrors.email}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="relative">
                                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="Sua senha"
                                                                    value={loginForm.password}
                                                                    onChange={(e) => {
                                                                        setLoginForm({ ...loginForm, password: e.target.value });
                                                                        if (loginErrors.password) {
                                                                            setLoginErrors(prev => ({ ...prev, password: "" }));
                                                                        }
                                                                    }}
                                                                    className={`pl-10 pr-10 bg-gray-800 border-gray-600 text-white ${loginErrors.password ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                                >
                                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                </button>
                                                                {loginErrors.password && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {loginErrors.password}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <Button
                                                            onClick={handleLogin}
                                                            className="w-full bg-green-500 hover:bg-green-600 text-white mt-6"
                                                        >
                                                            Entrar
                                                        </Button>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                </div>
            </div>

        </header>
        <DepositDialog setIsDepositOpen={setIsDepositoOpen} isDepositOpen={isDepositoOpen} />
    </>
}