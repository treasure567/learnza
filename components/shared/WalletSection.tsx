'use client';

import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { Loader2, Wallet, Copy, LogOut, Gift, ArrowDown, Coins } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { eduChainTestnet } from '@wagmi/core/chains';
import { useReadContract } from 'wagmi';
import { useEffect, useState } from 'react';
import { BigNumberish, formatUnits } from 'ethers';
import { toast } from 'sonner';
import { LEARNZA_ADDRESS, LEARNZA_ABI } from '../../app/contracts/contract';
import { userApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface WalletSectionProps {
    onConnectWallet?: () => void;
}

export function WalletSection({ onConnectWallet }: WalletSectionProps) {
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { data: profile, isLoading, refetch: refetchProfile } = useQuery({
        queryKey: ["profile"],
        queryFn: userApi.getProfile,
    });
    useEffect(() => {
        if (address && isConnected && profile && profile.data) {
            if (!profile.data.address) {
                userApi.updateAddress({ address: address });
                refetchProfile();
            } else if (profile.data.address.toLowerCase() !== address.toLowerCase()) {
                disconnect();
                toast.error("Only one wallet can be connected at a time");
            }
        }
    }, [address, isConnected, profile]);
    const { disconnect } = useDisconnect();
    const { data: balance, isLoading: isBalanceLoading } = useBalance({
        address: address,
    });
    const [userBalance, setUserBalance] = useState(0);
    const formatBigNumber = (value: BigNumberish, decimals: number): number => {
        const formatted = formatUnits(value, decimals);
        return parseFloat(formatted)
    };
    const copyAddress = () => {
        if (address && navigator.clipboard) {
            navigator.clipboard.writeText(address);
        }
    };
    const { data: tokenBalance, refetch: refetchTokenBalance, isSuccess: isTokenBalanceSuccess } = useReadContract({
        address: LEARNZA_ADDRESS as `0x${string}`,
        abi: LEARNZA_ABI,
        functionName: "balanceOf",
        args: [address],
        chainId: eduChainTestnet.id,
    });
    useEffect(() => {
        if (isTokenBalanceSuccess && tokenBalance) {
            const formattedBalance = formatBigNumber(tokenBalance as BigNumberish, 18);
            if (formattedBalance) setUserBalance(Number(formattedBalance));
        }
    }, [isTokenBalanceSuccess, tokenBalance]);

    if (isConnected && address) {
        return (
            <div className="hidden md:flex items-center gap-3">
                {/* LZA Balance Chip */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm hover:shadow-md transition-all">
                    <Coins className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-semibold text-gray-900">{userBalance.toLocaleString()} LZA</span>
                </div>

                {/* Wallet Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-medium text-gray-800 hidden sm:inline">
                                {address.slice(0, 6)}...{address.slice(-4)}
                            </span>
                            <span className="text-sm font-medium text-gray-800 sm:hidden">Connected</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-xl text-gray-900">
                        <div className="px-3 py-3">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs uppercase tracking-wide text-gray-500">Wallet</span>
                                <span className="text-xs font-semibold">{address.slice(0, 6)}...{address.slice(-4)}</span>
                            </div>
                            {!isBalanceLoading && balance && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-lg border border-gray-200 p-2.5">
                                        <p className="text-[11px] text-gray-500">Native</p>
                                        <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                            {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 p-2.5">
                                        <p className="text-[11px] text-gray-500">LZA</p>
                                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{userBalance.toLocaleString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => router.push('/dashboard/claim')}
                            className="cursor-pointer text-sm font-medium"
                        >
                            <Gift className="h-4 w-4 mr-2" />
                            Claim LZA
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={copyAddress}
                            className="cursor-pointer text-sm"
                        >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Address
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                disconnect();
                                toast.success("Wallet disconnected");
                            }}
                            className="cursor-pointer text-sm text-red-500 focus:text-red-500"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Disconnect
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    return (
        <button
            onClick={onConnectWallet}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm hover:shadow-md transition-all"
        >
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-semibold">Connect Wallet</span>
        </button>
    );
}