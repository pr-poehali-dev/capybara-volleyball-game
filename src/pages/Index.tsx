
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import CapybaraGame from '@/components/CapybaraGame';
import TeamSelection from '@/components/TeamSelection';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

type Team = 'pink' | 'purple' | 'orange' | 'mint';
type GameState = 'selection' | 'game';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('selection');
  const [selectedTeam, setSelectedTeam] = useState<Team>('pink');
  const [capybaraName, setCapybaraName] = useState('');
  const [customUltraPower, setCustomUltraPower] = useState('');
  const [powerMeter, setPowerMeter] = useState(0);
  const { toast } = useToast();

  const handleStartGame = () => {
    if (!capybaraName) {
      toast({
        title: "Нужно имя для капибары!",
        description: "Пожалуйста, назовите свою капибару перед началом игры.",
        variant: "destructive",
        action: <ToastAction altText="Понятно">Понятно</ToastAction>,
      });
      return;
    }
    
    toast({
      title: "Игра началась!",
      description: `${capybaraName} присоединяется к ${getTeamNameRussian(selectedTeam)} команде!`,
    });
    
    setGameState('game');
  };

  const getTeamNameRussian = (team: Team): string => {
    switch (team) {
      case 'pink': return 'розовой';
      case 'purple': return 'фиолетовой';
      case 'orange': return 'оранжевой';
      case 'mint': return 'мятной';
    }
  };

  const getDefaultUltraPower = (team: Team): string => {
    switch (team) {
      case 'pink': return 'Розовый вихрь';
      case 'purple': return 'Фиолетовая молния';
      case 'orange': return 'Огненный мяч';
      case 'mint': return 'Мятное усиление мяча';
    }
  };

  const activateUltraPower = () => {
    const powerName = customUltraPower || getDefaultUltraPower(selectedTeam);
    
    toast({
      title: "Ультраспособность активирована!",
      description: `${capybaraName} использует "${powerName}"!`,
    });
    
    setPowerMeter(0);
  };

  const handleBackToSelection = () => {
    setGameState('selection');
    setPowerMeter(0);
  };

  if (gameState === 'selection') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 p-4">
        <h1 className="text-4xl font-bold mb-6 text-center">Волейбол Капибар</h1>
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
          <TeamSelection selectedTeam={selectedTeam} onSelectTeam={setSelectedTeam} />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Имя твоей капибары</label>
            <Input 
              value={capybaraName} 
              onChange={(e) => setCapybaraName(e.target.value)} 
              placeholder="Введите имя капибары" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Собственная ультраспособность (необязательно)</label>
            <Input 
              value={customUltraPower} 
              onChange={(e) => setCustomUltraPower(e.target.value)} 
              placeholder={getDefaultUltraPower(selectedTeam)} 
            />
            <p className="text-xs text-gray-500">Оставьте пустым для использования способности по умолчанию.</p>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleStartGame}
            style={{ 
              backgroundColor: selectedTeam === 'pink' ? '#FF69B4' :
                             selectedTeam === 'purple' ? '#8A2BE2' :
                             selectedTeam === 'orange' ? '#FF7F50' : 
                             '#98FB98'
            }}
          >
            Начать игру!
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-bold">{capybaraName}</span>
          <span className="text-sm">({getTeamNameRussian(selectedTeam)} команда)</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2" style={{ minWidth: '200px' }}>
            <span>Ультра:</span>
            <Progress
              value={powerMeter}
              className="h-3"
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                '--progress-color': selectedTeam === 'pink' ? '#FF69B4' :
                                  selectedTeam === 'purple' ? '#8A2BE2' :
                                  selectedTeam === 'orange' ? '#FF7F50' : 
                                  '#98FB98'
              } as React.CSSProperties}
            />
            {powerMeter >= 100 && (
              <Button 
                size="sm" 
                onClick={activateUltraPower}
                style={{ 
                  backgroundColor: selectedTeam === 'pink' ? '#FF69B4' :
                                 selectedTeam === 'purple' ? '#8A2BE2' :
                                 selectedTeam === 'orange' ? '#FF7F50' : 
                                 '#98FB98'
                }}
              >
                Активировать!
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={handleBackToSelection}>
            Назад
          </Button>
        </div>
      </div>
      <CapybaraGame 
        team={selectedTeam} 
        onScorePoint={() => setPowerMeter(prev => Math.min(prev + 20, 100))}
      />
    </div>
  );
};

export default Index;
