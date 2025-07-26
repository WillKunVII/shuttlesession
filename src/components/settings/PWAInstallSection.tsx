import { Button } from "@/components/ui/button";
import { Smartphone, Share, Download } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useToast } from "@/hooks/use-toast";

export function PWAInstallSection() {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWAInstall();
  const { toast } = useToast();

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      toast({
        title: "App Installed",
        description: "ShuttleSession has been added to your home screen",
      });
    }
  };

  if (isInstalled) {
    return (
      <section>
        <h2 className="text-xl font-bold mb-2">App Installation</h2>
        <div className="flex items-center space-x-2 text-green-600">
          <Smartphone className="h-5 w-5" />
          <span>App is installed and ready to use offline</span>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border">
      <h2 className="text-xl font-semibold mb-3 text-foreground">Install App</h2>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Install ShuttleSession as an app for offline access and a better experience.
        </p>
        
        {isInstallable && (
          <Button onClick={handleInstall} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Install App</span>
          </Button>
        )}
        
        {isIOS && (
          <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
            <h3 className="font-semibold mb-2 flex items-center">
              <Share className="h-4 w-4 mr-2" />
              Install on iOS
            </h3>
            <ol className="text-sm space-y-1 text-muted-foreground">
              <li>1. Tap the Share button in Safari</li>
              <li>2. Scroll down and tap "Add to Home Screen"</li>
              <li>3. Tap "Add" to install the app</li>
            </ol>
          </div>
        )}
        
        {!isInstallable && !isIOS && (
          <p className="text-sm text-muted-foreground">
            Install option will appear when you use Chrome or Edge browser.
          </p>
        )}
      </div>
    </div>
  );
}