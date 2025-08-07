'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useBalance, useWriteContract } from 'wagmi';
import { LEARNZA_ADDRESS, LEARNZA_ABI } from '@/app/contracts/contract';
import { eduChainTestnet } from '@wagmi/core/chains';
import { motion } from 'framer-motion';
import { Clock, Gift, History, Coins, ArrowRight, HelpCircle, Wallet, Loader2, Timer } from 'lucide-react';
import { Button } from '@/app/components/ui';
import { formatUnits, BigNumberish } from 'ethers';
import { TokenTutorialModal } from '@/app/components/ui/token-tutorial-modal';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { QueryObserverResult } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ClaimPage() {
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const [nextClaimTime, setNextClaimTime] = useState<string>("00:00:00");
  const [totalClaimed, setTotalClaimed] = useState<number>(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [mintTime, setMintTime] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const { writeContractAsync: claimTokens } = useWriteContract();

  const { data: claimStatus, refetch: refetchClaimStatus, isSuccess: isClaimStatusSuccess }: {
    data: undefined | [boolean, number],
    refetch: () => Promise<QueryObserverResult<[boolean, number] | undefined, Error>>,
    isSuccess: boolean,
  } = useReadContract({
    address: LEARNZA_ADDRESS as `0x${string}`,
    abi: LEARNZA_ABI,
    functionName: "getClaimStatus",
    args: [address],
    chainId: eduChainTestnet.id,
    query: {
      enabled: !!address && isConnected,
    },
    
  });

  const { data: claimHistory, refetch: refetchClaimHistory, isSuccess: isClaimHistorySuccess } = useReadContract({
    address: LEARNZA_ADDRESS as `0x${string}`,
    abi: LEARNZA_ABI,
    functionName: "getClaimHistory",
    args: [address],
    chainId: eduChainTestnet.id,
    query: {
      enabled: !!address && isConnected,
    },
  }) as {
    data: readonly [bigint, bigint] | undefined,
    refetch: () => Promise<QueryObserverResult<readonly [bigint, bigint] | undefined, Error>>,
    isSuccess: boolean,
  };

  useEffect(() => {
    if (isClaimHistorySuccess && claimHistory) {
      const [amount, nextClaimTime] = claimHistory;
      setTotalClaimed(Number(formatUnits(amount, 18)));
      
      if (nextClaimTime > BigInt(0)) {
        const now = BigInt(Math.floor(Date.now() / 1000));
        if (nextClaimTime > now) {
          setTimeLeft(Number(nextClaimTime - now));
        }
      }
    }
  }, [isClaimHistorySuccess, claimHistory]);

  useEffect(() => {
    refetchClaimHistory();
  }, [isConnected, address]);

  const { data: eduBalance } = useBalance({
    address: address,
    chainId: eduChainTestnet.id,
  });

  const { data: tokenBalance, refetch: refetchTokenBalance, isSuccess: isTokenBalanceSuccess } = useReadContract({
    address: LEARNZA_ADDRESS as `0x${string}`,
    abi: LEARNZA_ABI,
    functionName: "balanceOf",
    args: [address],
    chainId: eduChainTestnet.id,
  });

  useEffect(() => {
    handleClaimStatus();
  }, [isConnected, address, isClaimStatusSuccess, claimStatus]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isTokenBalanceSuccess && tokenBalance) {
      const formattedBalance = formatBigNumber(tokenBalance as BigNumberish, 18);
      if (formattedBalance) setUserBalance(Number(formattedBalance));
    }
  }, [isTokenBalanceSuccess, tokenBalance]);

  const formatBigNumber = (value: BigNumberish, decimals: number): number => {
    const formatted = formatUnits(value, decimals);
    return parseFloat(formatted)
  };

  const handleClaimStatus = async () => {
    await refetchClaimStatus();
    if (isClaimStatusSuccess && claimStatus) {
      setCanClaim(claimStatus[0]);
    }
  }

  useEffect(() => {
    if (mintTime > 0) {
      setTimeLeft(mintTime);
    }
  }, [mintTime]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleClaim = async () => {
    if (!address || !canClaim) return;

    setIsClaiming(true);

    try {
      await claimTokens({
        address: LEARNZA_ADDRESS as `0x${string}`,
        abi: LEARNZA_ABI,
        functionName: "claimTokens",
        args: [],
        chainId: eduChainTestnet.id,
      });

      toast.success("Claim Successful!");
      handleClaimStatus();
      refetchTokenBalance();
      refetchClaimHistory();
      setShowSuccess(true);
      setIsClaiming(false);
    } catch (error) {
      setIsClaiming(false);
      toast.error("Claim failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Claim LZA Tokens</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Power your learning journey with LZA tokens. Claim 500 LZA tokens every 3 hours to unlock premium features and rewards.
          </p>
        </div>

        {isConnected ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Balance Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 mb-2">Your Balance</p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {isTokenBalanceSuccess ? formatBigNumber(tokenBalance as BigNumberish, 18) : "0"} LZA
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {eduBalance?.formatted.slice(0, 6)} {eduBalance?.symbol}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Coins className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>

              {/* Total Claimed Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 mb-2">Total Claimed</p>
                    <h3 className="text-3xl font-bold text-gray-900">{totalClaimed} LZA</h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <History className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              {/* Next Claim Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-500 mb-2">Next Claim In</p>
                    <h3 className="text-3xl font-bold text-gray-900 font-mono">{formatTime(timeLeft)}</h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Claim Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-lg max-w-2xl mx-auto text-center"
            >
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Claim 500 LZA Tokens</h2>
              <p className="text-gray-600 mb-6">
                Join the educational revolution. LZA tokens enable access to premium learning resources and certification programs.
              </p>
              <div className="space-y-4">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-8 rounded-full font-medium text-lg group transition-all duration-200"
                  onClick={() => handleClaim()}
                  disabled={timeLeft > 0 || isClaiming}
                >
                 {isClaiming ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 mr-2 animate-spin" />
                      Claiming LZA...
                    </>
                  ) : timeLeft > 0 ? (
                    <>
                      <Timer className="w-5 h-5 mr-2 mr-2" />
                      Next Claim in {formatTime(timeLeft)}
                    </>
                  ) : (
                    <>
                      Claim 500 LZA
                      <ArrowRight className="w-5 h-5 mr-2 ml-2 inline-block group-hover:translate-x-1 transition-transform" />
                      </>
                  )}
                </Button>

                <button
                  onClick={() => setShowTutorial(true)}
                  className="flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 font-medium mx-auto"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Not seeing your tokens?</span>
                </button>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-lg max-w-2xl mx-auto text-center"
          >
            <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to start claiming LZA tokens and unlock premium features.
            </p>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-8 rounded-full font-medium text-lg group transition-all duration-200"
              onClick={() => open()}
            >
              Connect Wallet
            </Button>
          </motion.div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">How It Works</h3>
            <p className="text-gray-600">
              Claim 500 LZA tokens every 3 hours to earn rewards. The more you claim, the more benefits you unlock in your learning journey.
            </p>
          </div>
          <div className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Token Benefits</h3>
            <p className="text-gray-600">
              Use LZA tokens to access premium courses, get personalized tutoring, and earn certifications on completion.
            </p>
          </div>
        </div>
      </div>

      <TokenTutorialModal 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
}
