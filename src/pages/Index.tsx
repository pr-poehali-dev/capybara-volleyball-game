
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import CapybaraGame from '@/components/CapybaraGame';
import TeamSelection from '@/components/TeamSelection';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type Team = 'pink' | 'purple' | 'orange' | 'mint';
type GameState = 'selection' | 'game';
type GameMode = 'mobile' | 'desktop';
type Gender = 'male' | 'female';
type CoatColor = 'normal' | 'albino' | 'dark' | 'black';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('selection');
  const [selectedTeam, setSelectedTeam] = useState<Team>('pink');
  const [capybaraName, setCapybaraName] = useState('');
  const [customUltraPower, setCustomUltraPower] = useState('');
  const [powerMeter, setPowerMeter] = useState(0);
  const [teammateNames] = useState(['Капи', 'Бара']);
  const [opponentNames] = useState(['Водяной', 'Пушистик', 'Плюшка']);
  const [gender, setGender] = useState<Gender>('male');
  const [coatColor, setCoatColor] = useState<CoatColor>('normal');
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  const isMobileDevice = useIsMobile();
  const [gameMode, setGameMode] = useState<GameMode>(isMobileDevice ? 'mobile' : 'desktop');

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

  const toggleGameMode = () => {
    setGameMode(prev => prev === 'mobile' ? 'desktop' : 'mobile');
  };

  const togglePreview = () => {
    setShowPreview(prev => !prev);
  };

  const getCoatColorName = (color: CoatColor): string => {
    switch (color) {
      case 'normal': return 'обычный';
      case 'albino': return 'альбинос';
      case 'dark': return 'темный';
      case 'black': return 'черный';
    }
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
            <label className="text-sm font-medium">Пол капибары</label>
            <RadioGroup 
              value={gender} 
              onValueChange={(value) => setGender(value as Gender)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Мужской</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Женский</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Окрас капибары</label>
            <Select value={coatColor} onValueChange={(value) => setCoatColor(value as CoatColor)}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите окрас" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Обычный</SelectItem>
                <SelectItem value="albino">Альбинос</SelectItem>
                <SelectItem value="dark">Темный</SelectItem>
                <SelectItem value="black">Черный</SelectItem>
              </SelectContent>
            </Select>
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
          
          <div className="flex items-center space-x-2">
            <Switch 
              checked={gameMode === 'mobile'} 
              onCheckedChange={toggleGameMode}
              id="game-mode"
            />
            <Label htmlFor="game-mode">
              {gameMode === 'mobile' ? 'Мобильный режим' : 'Режим компьютера'}
            </Label>
          </div>
          
          {showPreview ? (
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 p-4 rounded-lg mb-3 w-full">
                <h3 className="text-center font-medium mb-2">Предпросмотр капибары</h3>
                <div className="flex justify-center">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <CapybaraPreview 
                      team={selectedTeam}
                      gender={gender}
                      coatColor={coatColor}
                      name={capybaraName || "Капибара"}
                    />
                  </div>
                </div>
                <div className="text-center text-sm mt-2">
                  <p>Команда: {getTeamNameRussian(selectedTeam)}</p>
                  <p>Пол: {gender === 'male' ? 'мужской' : 'женский'}</p>
                  <p>Окрас: {getCoatColorName(coatColor)}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={togglePreview}>
                Скрыть предпросмотр
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={togglePreview}>
              Предпросмотр капибары
            </Button>
          )}
          
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
      <div className="p-4 bg-gray-800 text-white flex justify-between items-center flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-bold">{capybaraName}</span>
          <span className="text-sm">({getTeamNameRussian(selectedTeam)} команда)</span>
        </div>
        <div className="flex items-center gap-2 ml-auto mr-4">
          <Switch 
            checked={gameMode === 'mobile'} 
            onCheckedChange={toggleGameMode}
            id="game-mode-toggle"
          />
          <Label htmlFor="game-mode-toggle" className="text-sm whitespace-nowrap">
            {gameMode === 'mobile' ? 'Мобильный режим' : 'Режим компьютера'}
          </Label>
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
        playerName={capybaraName}
        teammateNames={teammateNames}
        opponentNames={opponentNames}
        gameMode={gameMode}
        gender={gender}
        coatColor={coatColor}
      />
    </div>
  );
};

// Component for preview
const CapybaraPreview = ({ 
  team, 
  gender, 
  coatColor, 
  name 
}: { 
  team: Team;
  gender: Gender;
  coatColor: CoatColor;
  name: string;
}) => {
  const getCapybaraColor = () => {
    if (coatColor === 'normal') {
      return team === 'pink' ? '#FF69B4' : 
             team === 'purple' ? '#8A2BE2' : 
             team === 'orange' ? '#FF7F50' : 
             '#98FB98';
    } else if (coatColor === 'albino') {
      return '#FFF0E0';
    } else if (coatColor === 'dark') {
      return '#8B4513';
    } else if (coatColor === 'black') {
      return '#333333';
    }
  };
  
  return (
    <div className="relative">
      <div className="text-center text-xs absolute -top-6 w-full">
        {name}
      </div>
      
      {/* Body */}
      <div 
        className="w-24 h-16 rounded-full absolute bottom-0" 
        style={{ backgroundColor: getCapybaraColor() }}
      ></div>
      
      {/* Head */}
      <div 
        className="w-16 h-16 rounded-full absolute -bottom-2 -left-2" 
        style={{ backgroundColor: getCapybaraColor() }}
      ></div>
      
      {/* Eyes */}
      <div className="w-2 h-2 rounded-full bg-black absolute bottom-8 left-2"></div>
      <div className="w-2 h-2 rounded-full bg-black absolute bottom-8 left-6"></div>
      
      {/* Eyelashes (for female) */}
      {gender === 'female' && (
        <>
          <div className="w-1 h-2 bg-black absolute bottom-9 left-1 transform -rotate-45"></div>
          <div className="w-1 h-2 bg-black absolute bottom-9 left-3 transform rotate-45"></div>
          <div className="w-1 h-2 bg-black absolute bottom-9 left-5 transform -rotate-45"></div>
          <div className="w-1 h-2 bg-black absolute bottom-9 left-7 transform rotate-45"></div>
        </>
      )}
      
      {/* Nose */}
      <div className="w-3 h-2 rounded-full bg-black absolute bottom-4 left-4"></div>
    </div>
  );
};

export default Index;
