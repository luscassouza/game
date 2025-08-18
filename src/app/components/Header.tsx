
"use client"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContaUsuario } from "@/lib/types";
import { AlertCircle, Eye, EyeOff, LogOut, Lock, Settings, Shield, User, UserPlus, Users, BanknoteArrowUp, Link } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabaseBrowser } from "@/lib/supabase/client";





export default function Header() {
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("register");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registerForm, setRegisterForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: ""
    });
    const supabase = supabaseBrowser();
    const [userConfig, setUserConfig] = useState<ContaUsuario | null>(null);



    const [loginForm, setLoginForm] = useState({
        email: "",
        password: ""
    });

    // Estados de erro
    const [registerErrors, setRegisterErrors] = useState({
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

    const [autenticated, setAutenticated] = useState(false);

    const checkAuth = async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            return;
        }

        if (data?.user) {
            setAutenticated(true);
            const {data: userConfig, error: userConfigError} = await supabase.from("user_configs").select("*").eq("supabaseuserid", data.user.id).single();
            if (userConfigError) {
                return;
            }
            setUserConfig({
                saldoUsuario: userConfig.balance,
                fullName: userConfig.name,
            } as ContaUsuario);

        }
    };
    // Carregar conta do localStorage
    useEffect(() => {
        checkAuth();
    }, []);

    // Função para validar email
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Função para limpar erros
    const clearRegisterErrors = () => {
        setRegisterErrors({

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

    const handleRegister = async () => {
        // Limpar erros gerais
        clearRegisterErrors();

        // Validar todos os campos
        validateRegisterField("password", registerForm.password);
        validateRegisterField("confirmPassword", registerForm.confirmPassword);
        validateRegisterField("fullName", registerForm.fullName);

        // Verificar se há erros
        const hasErrors = Object.values(registerErrors).some(error => error !== "") ||
            !registerForm.email.trim() ||
            !registerForm.password ||
            !registerForm.confirmPassword ||
            !registerForm.fullName.trim() ||
            !validateEmail(registerForm.email) ||
            registerForm.password.length < 6 ||
            registerForm.password !== registerForm.confirmPassword;

        if (hasErrors) {
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: registerForm.email,
            password: registerForm.password,
            options: { data: { name: registerForm.fullName } } // vai cair no trigger (raw_user_meta_data)
        });

        if (error) {
            toast.error("Conta registrada, faça um deposito para jogar", {
                position: "top-center",
                style: {
                    background: "#059004",
                    color: "white",
                    border: "1px #059004"
                }
            })
            return;

        };


        navigate("/deposito")
        toast.success("Conta registrada, faça um deposito para jogar", {
            position: "top-center",
            style: {
                background: "#059004",
                color: "white",
                border: "1px #059004"
            }
        })

        setIsRegisterOpen(false);
        setRegisterForm({ email: "", password: "", confirmPassword: "", fullName: "" });
        clearRegisterErrors();
    };

    const handleLogin = async () => {
        clearLoginErrors();

        if (!loginForm.email.trim()) {
            setLoginErrors(prev => ({ ...prev, email: "Email é obrigatório" }));
            return;
        }

        if (!loginForm.password) {
            setLoginErrors(prev => ({ ...prev, password: "Senha é obrigatória" }));
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginForm.email,
            password: loginForm.password,
        })

        if (error) {
            setLoginErrors(prev => ({ ...prev, general: "Email ou senha incorretos!" }));
            return;
        }

        navigate("/deposito");
        toast.success("Faça um deposito para Jogar e Ganhar!", {
            position: "top-center",
            style: {
                background: "#059004",
                color: "white",
                border: "1px #059004"
            }
        })
        setLoginForm({ email: "", password: "" })

        setIsRegisterOpen(false)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut();

    };
    const router = useRouter();

    const navigate = (path: string) => {
        router.push(path);
    }
    const handleOpenRegister = () => {
        setActiveTab("register");
        setIsRegisterOpen(true);
    };
    return <>
        <header className="border-b border-gray-800 bg-black px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                <div className="flex relative w-[100px] h-[50px] items-center gap-2">
                    <a href="/">

                        <Image
                            className="object-contain"
                            src="/logo.png"
                            alt="logo"
                            fill
                        />
                    </a>



                </div>
                <div className="flex items-center gap-4">
                    {autenticated ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-gray-800 px-2 md:px-3 py-1 md:py-2 rounded-lg">
                                <span className="text-green-400 font-bold text-xs md:text-sm">R$</span>
                                <span className="text-white font-bold text-xs md:text-sm">{userConfig?.saldoUsuario.toFixed(2)}</span>

                            </div>
                            <a
                                href="/deposito"
                                className="bg-green-500 rounded-md flex justify-evenly w-min  hover:bg-green-600 text-black flex items-center gap-2 h-min  md:h-10 p-1 md:px-4"

                            >

                                <BanknoteArrowUp className="h-6 h-6" />
                                <span className="hidden md:inline">Depositar</span>
                            </a>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8  bg-green-500 rounded-full p-0">
                                        <User className=" text-black" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 bg-zinc-900 border-gray-700" >
                                    <div className="px-2 py-1.5">
                                        <p className="text-sm font-medium text-white">{userConfig?.fullName}</p>

                                        <p className="text-xs text-gray-400">Saldo: R$ {userConfig?.saldoUsuario.toFixed(2)}</p>

                                    </div>
                                    <DropdownMenuSeparator className="bg-gray-700" />



                                    <DropdownMenuItem onClick={() => {
                                        navigate("/account");
                                    }} className="text-white cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Detalhes da conta</span>
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
                                        className="flex bg-green-600 items-center gap-1 md:gap-2 text-white hover:text-green-400 text-xs md:text-sm h-8 md:h-10 px-2 md:px-4"
                                        onClick={handleOpenRegister}
                                    >
                                        <UserPlus className="h-3 w-3 md:h-4 md:w-4" />
                                        <span className="inline ">Cadastrar</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="p-0 min-w-screen md:min-w-[800px] h-auto md:h-[500px] bg-zinc-900 border-black">
                                    {/* Desktop Layout */}
                                    <div className="hidden md:flex w-full h-full">
                                        {/* Left Side - Promotional Image */}
                                        <div className="flex-1 relative bg-gradient-to-br from-blue-600 to-purple-700">
                                            <Image src="/criativo-login.png" alt="promotion" fill />
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
                                                                    value={registerForm.email}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, email: e.target.value });
                                                                        validateRegisterField("email", e.target.value);
                                                                    }}
                                                                    className={`pl-10 bg-zinc-900 border-gray-600 text-white rounded-md ${registerErrors.email ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                {registerErrors.email && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.email}
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
                                            <Image src="/banner-2.png" fill alt="promotion" />
                                        </div>

                                        {/* Bottom - Auth Form */}
                                        <div className="flex-1 p-6 bg-black">
                                            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                                <TabsList className="grid w-full grid-cols-2 bg-zinc-800 mb-6">
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
                                                                    value={registerForm.email}
                                                                    onChange={(e) => {
                                                                        setRegisterForm({ ...registerForm, email: e.target.value });
                                                                        validateRegisterField("email", e.target.value);
                                                                    }}
                                                                    className={`pl-10 bg-zinc-800 border-gray-600 text-white ${registerErrors.email ? "border-red-500" : ""
                                                                        }`}
                                                                />
                                                                {registerErrors.email && (
                                                                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                                                        <AlertCircle className="h-3 w-3" />
                                                                        {registerErrors.email}
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
                                                                    className={`pl-10 pr-10 bg-zinc-800 border-gray-600 text-white ${registerErrors.password ? "border-red-500" : ""
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
                                                                    className={`pl-10 pr-10 bg-zinc-800 border-gray-600 text-white ${registerErrors.confirmPassword ? "border-red-500" : ""
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
                                                                    className={`pl-10 bg-zinc-800 border-gray-600 text-white ${registerErrors.fullName ? "border-red-500" : ""
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
                                                                    className={`pl-10 bg-zinc-800 border-gray-600 text-white ${loginErrors.email ? "border-red-500" : ""
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
                                                                    className={`pl-10 pr-10 bg-zinc-800 border-gray-600 text-white ${loginErrors.password ? "border-red-500" : ""
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
    </>
}