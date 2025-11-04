'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [testing, setTesting] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [supabaseServiceKey, setSupabaseServiceKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const router = useRouter();

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setTesting(true);
    setConnectionStatus('testing');

    try {
      // Tester la connexion
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (response.ok || response.status === 401) {
        setConnectionStatus('success');
        toast.success('Connexion Supabase réussie !');
        setTimeout(() => setStep(2), 1000);
      } else {
        setConnectionStatus('error');
        toast.error('Impossible de se connecter à Supabase');
      }
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Erreur de connexion', {
        description: 'Vérifiez l\'URL et les clés',
      });
    } finally {
      setTesting(false);
    }
  };

  const saveConfig = () => {
    // Dans un environnement réel, cela sauvegarderait dans .env.local via une API
    // Pour l'instant, afficher les instructions
    toast.success('Configuration prête !', {
      description: 'Ajoutez ces valeurs à votre .env.local',
    });
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
      <div className="container max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">BPC Funnels</h1>
          <p className="text-muted-foreground">Configuration initiale</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= i
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i}
                </div>
                {i < 3 && (
                  <div
                    className={`h-1 w-24 mx-2 ${
                      step > i ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Supabase</span>
            <span>Admin</span>
            <span>Terminé</span>
          </div>
        </div>

        {/* Step 1: Supabase */}
        {step === 1 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Configuration Supabase</CardTitle>
              <CardDescription>
                Connectez votre projet Supabase à BPC Funnels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-900 mb-2">💡 Où trouver ces informations ?</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800">
                  <li>Allez sur <a href="https://supabase.com/dashboard" target="_blank" className="underline">supabase.com/dashboard</a></li>
                  <li>Sélectionnez votre projet</li>
                  <li>Allez dans <strong>Settings</strong> → <strong>API</strong></li>
                </ol>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">Project URL *</Label>
                <Input
                  id="url"
                  placeholder="https://xxxxx.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anon">anon public key *</Label>
                <Input
                  id="anon"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  type="password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">service_role key (optionnel)</Label>
                <Input
                  id="service"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseServiceKey}
                  onChange={(e) => setSupabaseServiceKey(e.target.value)}
                  type="password"
                />
              </div>

              {connectionStatus !== 'idle' && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  connectionStatus === 'success' ? 'bg-green-50 text-green-800' :
                  connectionStatus === 'error' ? 'bg-red-50 text-red-800' :
                  'bg-blue-50 text-blue-800'
                }`}>
                  {connectionStatus === 'testing' && <Loader2 className="h-5 w-5 animate-spin" />}
                  {connectionStatus === 'success' && <CheckCircle2 className="h-5 w-5" />}
                  {connectionStatus === 'error' && <XCircle className="h-5 w-5" />}
                  <span className="font-medium">
                    {connectionStatus === 'testing' && 'Test de connexion...'}
                    {connectionStatus === 'success' && 'Connexion réussie !'}
                    {connectionStatus === 'error' && 'Connexion échouée'}
                  </span>
                </div>
              )}

              <Button
                onClick={testConnection}
                disabled={testing || !supabaseUrl || !supabaseAnonKey}
                className="w-full"
              >
                {testing ? 'Test en cours...' : 'Tester la connexion'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Utilisateur Admin */}
        {step === 2 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Créer votre compte admin</CardTitle>
              <CardDescription>
                Configurez votre premier utilisateur administrateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-yellow-900 mb-2">⚠️ Action requise dans Supabase</p>
                <ol className="list-decimal list-inside space-y-1 text-yellow-800">
                  <li>Allez dans <strong>Authentication</strong> → <strong>Users</strong></li>
                  <li>Cliquez sur <strong>"Add user"</strong></li>
                  <li>Entrez votre email et mot de passe</li>
                  <li>Cochez <strong>"Auto Confirm User"</strong></li>
                  <li>Cliquez sur <strong>"Create user"</strong></li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Précédent
                </Button>
                <Button onClick={saveConfig} className="flex-1">
                  Utilisateur créé, continuer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Terminé */}
        {step === 3 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Configuration terminée !
              </CardTitle>
              <CardDescription>
                Votre instance de BPC Funnels est prête à l'emploi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-medium text-green-900 mb-3">📝 Dernière étape :</p>
                <p className="text-sm text-green-800 mb-3">
                  Ajoutez ces variables à votre fichier <code className="bg-green-100 px-1 rounded">.env.local</code> :
                </p>
                <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
${supabaseServiceKey ? `SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}` : '# SUPABASE_SERVICE_ROLE_KEY=...'}
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Prochaines étapes :</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✅ 1. Copiez les variables dans .env.local</li>
                  <li>✅ 2. Redémarrez le serveur (npm run dev)</li>
                  <li>✅ 3. Connectez-vous avec votre email/mot de passe</li>
                  <li>✅ 4. Créez votre premier funnel !</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => router.push('/login')} className="flex-1">
                  Aller à la connexion
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://github.com/your-repo/bpc-funnels/blob/main/README.md', '_blank')}
                >
                  Voir la documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Besoin d'aide ? Consultez le <a href="/README.md" className="underline">README</a>
        </p>
      </div>
    </div>
  );
}

