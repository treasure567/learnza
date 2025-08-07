"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, Button, Select, OtpModal } from "@/app/components/ui";
import {
  User,
  Bell,
  Lock,
  Palette,
  Volume2,
  Globe,
  Smartphone,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  Copy,
  Wallet,
  Trash2,
  Phone,
  Key
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/lib/api";
import { toast } from "sonner";
import { WalletConfirmationModal } from "@/components/ui/wallet-confirmation-modal";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useDisconnect } from "wagmi";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();

  const [isUpdatingVoice, setIsUpdatingVoice] = useState(false);
  const [isUpdatingVoiceCode, setIsUpdatingVoiceCode] = useState<string | null>(null);

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

useEffect(() => {
  setSettings(prev => ({
    ...prev,
    profile: { ...prev.profile, name: profile?.data?.name || "", email: profile?.data?.email || "", address: profile?.data?.address || "" },
    voice: { ...prev.voice, selected: profile?.data?.language?.code || "en" },
  }));
}, [profile]);

  const [settings, setSettings] = useState({
    profile: {
      name: profile?.data?.name || "",
      email: profile?.data?.email || "",
      address: profile?.data?.address || ""
    },
    password: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
    voice: {
      selected: profile?.data?.language?.code || "english",
    },
    integration: {
      phoneNumber: "",
      isVerified: false
    }
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordChange = async () => {
    if (settings.password.newPassword !== settings.password.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (!settings.password.currentPassword || !settings.password.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await userApi.changePassword({
        currentPassword: settings.password.currentPassword,
        newPassword: settings.password.newPassword
      });
      if (res.status) {
        toast.success("Password changed successfully");
        setSettings(prev => ({
          ...prev,
          password: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          }
        }));
      } else {
        toast.error(res.message || "Failed to change password");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "voice", label: "Voice", icon: Volume2 },
    { id: "integration", label: "Integration", icon: Phone }
  ];

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const updateLanguage = (code: string) => {
    setIsUpdatingVoice(true);
    setIsUpdatingVoiceCode(code);
    userApi.updateLanguage({ languageCode: code }).then((res) => {
      if (res.status) {
        refetchProfile().then(() => {
          toast.success("Language updated successfully");
          setIsUpdatingVoice(false);
          setIsUpdatingVoiceCode(null);
        });
      } else {
        toast.error("Failed to update language");
        setIsUpdatingVoice(false);
        setIsUpdatingVoiceCode(null);
      }
    });
  }

  const handleWalletConfirm = () => {
    setShowWalletModal(false);
    open();
  };


  const availableVoices = [
    { id: "english", name: "English", code: 'en', language: "English (EN)", src: "/audio/english.mp3" },
    { id: "yoruba", name: "Yorùbá", code: 'yo', language: "Yoruba (YO)", src: "/audio/yoruba.mp3" },
    { id: "igbo", name: "Igbo", code: 'ig', language: "Igbo (IG)", src: "/audio/igbo.mp3" },
    { id: "hausa", name: "Hausa", code: 'ha', language: "Hausa (HA)", src: "/audio/hausa.wav" },
  ];

  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const togglePlay = (id: string) => {
    const current = playingId ? audioRefs.current[playingId] : null;
    const next = audioRefs.current[id];

    if (playingId === id) {
      current?.pause();
      current && (current.currentTime = 0);
      setPlayingId(null);
      return;
    }

    if (current && !current.paused) {
      current.pause();
      current.currentTime = 0;
    }

    if (next) {
      next.currentTime = 0;
      next.play().catch(() => { });
      setPlayingId(id);
      next.onended = () => setPlayingId(null);
    }
  };

  const copyAddress = () => {
    if (settings.profile.address && navigator.clipboard) {
      navigator.clipboard.writeText(settings.profile.address);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-lg text-gray-600 mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <WalletConfirmationModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConfirm={handleWalletConfirm}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <div className="space-y-1 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 text-left rounded-lg transition-colors ${activeTab === tab.id
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={settings.profile.name}
                          onChange={(e) => updateSetting("profile", "name", e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={settings.profile.email}
                          onChange={(e) => updateSetting("profile", "email", e.target.value)}
                          readOnly
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wallet Address
                      </label>
                      {profile?.data?.address && address && isConnected ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm">
                            {profile?.data?.address}
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(profile?.data?.address || "");
                              toast.success("Wallet address copied to clipboard");
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Copy wallet address"
                          >
                            <Copy className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>
                      ) : (
                        <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                          <div className="flex flex-col items-center justify-center text-center">
                            <Wallet className="w-8 h-8 text-gray-400 mb-2" />
                            <h3 className="text-sm font-medium text-gray-900">No Wallet Connected</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Connect your wallet to enable blockchain features and rewards
                            </p>
                            <Button
                              className="mt-4"
                              onClick={() => {
                                setShowWalletModal(true);
                              }}
                            >
                              Connect Wallet
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "password" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Change Password</h2>
                  <p className="text-sm text-gray-500 mb-6">Update your password to keep your account secure</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={settings.password.currentPassword}
                          onChange={(e) => updateSetting("password", "currentPassword", e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 pr-10"
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={settings.password.newPassword}
                          onChange={(e) => updateSetting("password", "newPassword", e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 pr-10"
                          placeholder="Enter your new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={settings.password.confirmPassword}
                          onChange={(e) => updateSetting("password", "confirmPassword", e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 pr-10"
                          placeholder="Confirm your new password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={handlePasswordChange}
                        loading={isChangingPassword}
                        disabled={isChangingPassword}
                        className="w-full sm:w-auto"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "voice" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Voice & Narration</h2>
                  <p className="text-sm text-gray-500 mb-6">Preview and choose a voice for your AI tutor.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableVoices.map((voice) => {
                      const isSelected = profile?.data?.language.code == voice.code;
                      const isPlaying = playingId === voice.id;
                      return (
                        <div
                          key={voice.id}
                          className={`relative rounded-2xl border p-4 transition-all duration-300 ${isSelected ? "border-green-400 bg-green-50/50" : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                                <Volume2 className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{voice.name}</div>
                                <div className="text-xs text-gray-500">{voice.language}</div>
                              </div>
                            </div>
                            {isSelected && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Selected</span>
                            )}
                          </div>

                          <audio
                            ref={(el) => {
                              audioRefs.current[voice.id] = el;
                              if (el) {
                                el.onended = () => setPlayingId((prev) => (prev === voice.id ? null : prev));
                                el.onplay = () => setPlayingId(voice.id);
                                el.onpause = () => setPlayingId((prev) => (prev === voice.id ? null : prev));
                              }
                            }}
                            src={voice.src}
                            preload="none"
                            controls
                            className="mt-4 w-full hidden"
                          />

                          <div className="mt-4 flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => togglePlay(voice.id)}
                              className="px-3"
                            >
                              {isPlaying ? "Pause" : "Preview"}
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => updateLanguage(voice.code)}
                              className="px-3"
                              disabled={isSelected || isUpdatingVoice || isUpdatingVoiceCode === voice.code}
                              loading={isUpdatingVoice && isUpdatingVoiceCode === voice.code}
                            >
                              {isSelected ? "Selected" : `Use ${voice.name}`}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "integration" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Phone Integration</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        <Select
                          value={countryCode}
                          onChange={(value) => setCountryCode(value)}
                          options={[
                            { label: "+1 (US/CA)", value: "+1" },
                            { label: "+44 (UK)", value: "+44" },
                            { label: "+234 (NG)", value: "+234" },
                            { label: "+91 (IN)", value: "+91" },
                            { label: "+86 (CN)", value: "+86" },
                            { label: "+81 (JP)", value: "+81" },
                            { label: "+49 (DE)", value: "+49" },
                            { label: "+33 (FR)", value: "+33" },
                            { label: "+39 (IT)", value: "+39" },
                            { label: "+34 (ES)", value: "+34" },
                            { label: "+61 (AU)", value: "+61" },
                            { label: "+55 (BR)", value: "+55" },
                            { label: "+7 (RU)", value: "+7" },
                            { label: "+82 (KR)", value: "+82" },
                            { label: "+52 (MX)", value: "+52" },
                            { label: "+65 (SG)", value: "+65" },
                            { label: "+27 (ZA)", value: "+27" },
                            { label: "+254 (KE)", value: "+254" },
                            { label: "+233 (GH)", value: "+233" },
                            { label: "+251 (ET)", value: "+251" },
                            { label: "+20 (EG)", value: "+20" },
                            { label: "+212 (MA)", value: "+212" },
                            { label: "+216 (TN)", value: "+216" },
                            { label: "+256 (UG)", value: "+256" },
                            { label: "+250 (RW)", value: "+250" },
                            { label: "+255 (TZ)", value: "+255" },
                            { label: "+237 (CM)", value: "+237" },
                            { label: "+225 (CI)", value: "+225" },
                            { label: "+221 (SN)", value: "+221" },
                            { label: "+244 (AO)", value: "+244" }
                          ]}
                        />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter phone number"
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Verification Status</h4>
                        <p className="text-sm text-gray-500">
                          {settings.integration.isVerified ? "Phone number verified" : "Phone number not verified"}
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowOtpModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={!phoneNumber}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {settings.integration.isVerified ? "Re-verify" : "Verify"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        phoneNumber={phoneNumber}
        countryCode={countryCode}
        onVerify={(otpString) => {
          setSettings(prev => ({
            ...prev,
            integration: {
              ...prev.integration,
              phoneNumber: `${countryCode} ${phoneNumber}`,
              isVerified: true
            }
          }));
        }}
      />
    </div>
  );
}

function getPrivacyDescription(key: string): string {
  const descriptions: Record<string, string> = {
    shareProgress: "Allow others to see your learning progress",
    dataCollection: "Allow collection of usage data for improvement",
    analyticsOptIn: "Participate in anonymous analytics"
  };
  return descriptions[key] || "";
}
