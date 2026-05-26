"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { FileUploader } from "@/components/ui/file-uploader";

export default function AdminSettingsPage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const user = session?.user as any;
  
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [workerNotifs, setWorkerNotifs] = useState(true);

  const handleSaveProfile = async () => {
    toast.success("Profile saved successfully");
    // In a real app, you would make an API call here to update the user's profile
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    toast.success("Password updated successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Settings</h2>
        <p className="text-muted-foreground">Manage your admin account settings and agency preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-transparent h-auto p-0 border-b w-full justify-start rounded-none">
          <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2">Profile</TabsTrigger>
          <TabsTrigger value="password" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2">Password</TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2">Appearance</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-2">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and avatar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Admin")}`} />
                  <AvatarFallback className="text-2xl">{(user?.name || "A").substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium leading-none">Avatar</h4>
                  <p className="text-sm text-muted-foreground">Upload a new avatar image to personalize your profile.</p>
                  <FileUploader 
                    bucket="avatars"
                    maxSizeMB={2}
                    acceptedTypes="image/*"
                    onUploadComplete={(url) => {
                      toast.success("Avatar uploaded");
                      update({ avatarUrl: url });
                    }}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled />
                  <p className="text-[10px] text-muted-foreground">Email cannot be changed.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-6 mt-6">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleUpdatePassword} disabled={!currentPassword || !newPassword || !confirmPassword}>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 mt-6">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Label>Theme Preference</Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div 
                    className={`flex items-center gap-2 border rounded-md p-4 cursor-pointer hover:border-primary transition-colors ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800'}`}
                    onClick={() => setTheme('light')}
                  >
                    <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                      {theme === 'light' && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <span>Light Mode</span>
                  </div>
                  <div 
                    className={`flex items-center gap-2 border rounded-md p-4 cursor-pointer hover:border-primary transition-colors ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800'}`}
                    onClick={() => setTheme('dark')}
                  >
                    <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                      {theme === 'dark' && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <span>Dark Mode</span>
                  </div>
                  <div 
                    className={`flex items-center gap-2 border rounded-md p-4 cursor-pointer hover:border-primary transition-colors ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800'}`}
                    onClick={() => setTheme('system')}
                  >
                    <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                      {theme === 'system' && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <span>System Default</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you receive alerts and updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive emails about new projects, invoice approvals, etc.</p>
                </div>
                <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive in-app push notifications for important events.</p>
                </div>
                <Switch checked={pushNotifs} onCheckedChange={setPushNotifs} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Worker Activity</Label>
                  <p className="text-sm text-muted-foreground">Get notified when workers submit deliverables or invoices.</p>
                </div>
                <Switch checked={workerNotifs} onCheckedChange={setWorkerNotifs} />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={() => toast.success("Notification preferences saved")}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
