import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Lock } from 'lucide-react';

interface SecurityGateProps {
    children: React.ReactNode;
}

const PASSCODE_KEY = 'unidonuts_auth_token';
// 簡易パスコード。実運用では環境変数などで管理するのが望ましいが、今回はクライアントサイド完結のためここで定義
const CORRECT_PASSCODE = 'okazaemon';

export const SecurityGate: React.FC<SecurityGateProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem(PASSCODE_KEY);
        if (token === CORRECT_PASSCODE) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (passcode === CORRECT_PASSCODE) {
            localStorage.setItem(PASSCODE_KEY, passcode);
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('パスコードが間違っています');
        }
    };

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md border border-secondary-dark/20 w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-800">
                        <span style={{ color: '#dac7a0' }}>UNI</span>
                        <span style={{ color: '#95604b' }} className="ml-1">DONUTS</span>
                        <span className="block text-sm font-normal text-gray-500 mt-1">Work Log Access</span>
                    </h1>
                    <p className="text-gray-500 text-sm">閲覧するにはパスコードを入力してください</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                        type="password"
                        placeholder="パスコード"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        error={error}
                        autoFocus
                    />
                    <Button type="submit" className="w-full justify-center">
                        認証する
                    </Button>
                </form>
            </div>
        </div>
    );
};
