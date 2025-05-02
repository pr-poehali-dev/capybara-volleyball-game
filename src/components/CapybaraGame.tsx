
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type Team = 'pink' | 'purple' | 'orange' | 'mint';
type GameMode = 'mobile' | 'desktop';
type Gender = 'male' | 'female';
type CoatColor = 'normal' | 'albino' | 'dark' | 'black';

interface CapybaraGameProps {
  team: Team;
  onScorePoint: () => void;
  playerName: string;
  teammateNames: string[];
  opponentNames: string[];
  gameMode: GameMode;
  gender: Gender;
  coatColor: CoatColor;
}

interface Position {
  x: number;
  y: number;
}

interface Capybara {
  team: Team;
  position: Position;
  name: string;
  gender: Gender;
  coatColor: CoatColor;
  isPlayer?: boolean;
}

const COURT_WIDTH = 600;
const COURT_HEIGHT = 400;
const NET_HEIGHT = 60;

const CapybaraGame: React.FC<CapybaraGameProps> = ({ 
  team, 
  onScorePoint, 
  playerName, 
  teammateNames, 
  opponentNames, 
  gameMode,
  gender,
  coatColor
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ball, setBall] = useState<Position>({ x: COURT_WIDTH / 2, y: 50 });
  const [ballVelocity, setBallVelocity] = useState<Position>({ x: 0, y: 3 });
  const [playerCapybara, setPlayerCapybara] = useState<Position>({ x: COURT_WIDTH / 4, y: COURT_HEIGHT - 50 });
  
  // Random gender generator for NPCs
  const randomGender = (): Gender => Math.random() > 0.5 ? 'male' : 'female';
  
  // Random coat color generator for NPCs
  const randomCoatColor = (): CoatColor => {
    const colors: CoatColor[] = ['normal', 'albino', 'dark', 'black'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const [teammates, setTeammates] = useState<Capybara[]>([
    { 
      team, 
      position: { x: COURT_WIDTH / 4 - 80, y: COURT_HEIGHT - 50 }, 
      name: teammateNames[0],
      gender: randomGender(),
      coatColor: randomCoatColor()
    },
    { 
      team, 
      position: { x: COURT_WIDTH / 4 + 80, y: COURT_HEIGHT - 50 }, 
      name: teammateNames[1],
      gender: randomGender(),
      coatColor: randomCoatColor()
    },
  ]);
  
  // Choose random teams for opponents
  const getRandomOpposingTeam = (playerTeam: Team): Team => {
    const teams: Team[] = ['pink', 'purple', 'orange', 'mint'];
    const opposingTeams = teams.filter(t => t !== playerTeam);
    return opposingTeams[Math.floor(Math.random() * opposingTeams.length)];
  };
  
  const [opponents, setOpponents] = useState<Capybara[]>([
    { 
      team: getRandomOpposingTeam(team), 
      position: { x: (COURT_WIDTH / 4) * 3 - 80, y: COURT_HEIGHT - 50 }, 
      name: opponentNames[0],
      gender: randomGender(),
      coatColor: randomCoatColor()
    },
    { 
      team: getRandomOpposingTeam(team), 
      position: { x: (COURT_WIDTH / 4) * 3, y: COURT_HEIGHT - 50 }, 
      name: opponentNames[1],
      gender: randomGender(),
      coatColor: randomCoatColor()
    },
    { 
      team: getRandomOpposingTeam(team), 
      position: { x: (COURT_WIDTH / 4) * 3 + 80, y: COURT_HEIGHT - 50 }, 
      name: opponentNames[2],
      gender: randomGender(),
      coatColor: randomCoatColor()
    },
  ]);
  
  const [score, setScore] = useState({ player: 0, opponent: 0 });
  const [gameMessage, setGameMessage] = useState('');
  const animationRef = useRef<number>();
  const [lastPress, setLastPress] = useState<string | null>(null);
  const [touchPosition, setTouchPosition] = useState<Position | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const render = () => {
      // Clear canvas
      context.clearRect(0, 0, COURT_WIDTH, COURT_HEIGHT);

      // Draw court
      context.fillStyle = '#f0f0f0';
      context.fillRect(0, 0, COURT_WIDTH, COURT_HEIGHT);
      
      // Draw net
      context.fillStyle = '#888';
      context.fillRect(COURT_WIDTH / 2 - 2, COURT_HEIGHT - NET_HEIGHT, 4, NET_HEIGHT);
      
      // Draw court divider
      context.strokeStyle = '#555';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(COURT_WIDTH / 2, COURT_HEIGHT);
      context.lineTo(COURT_WIDTH / 2, COURT_HEIGHT - NET_HEIGHT);
      context.stroke();

      // Draw background lines
      context.strokeStyle = '#ddd';
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(COURT_WIDTH / 4, COURT_HEIGHT);
      context.lineTo(COURT_WIDTH / 4, COURT_HEIGHT - 5);
      context.stroke();
      context.beginPath();
      context.moveTo((COURT_WIDTH / 4) * 3, COURT_HEIGHT);
      context.lineTo((COURT_WIDTH / 4) * 3, COURT_HEIGHT - 5);
      context.stroke();

      // Draw player capybara with name
      drawCapybara(
        context, 
        playerCapybara.x, 
        playerCapybara.y, 
        team, 
        true, 
        playerName,
        gender,
        coatColor
      );
      
      // Draw teammates with names
      teammates.forEach(capybara => {
        drawCapybara(
          context, 
          capybara.position.x, 
          capybara.position.y, 
          capybara.team, 
          false, 
          capybara.name,
          capybara.gender,
          capybara.coatColor
        );
      });
      
      // Draw opponents with names
      opponents.forEach(capybara => {
        drawCapybara(
          context, 
          capybara.position.x, 
          capybara.position.y, 
          capybara.team, 
          false, 
          capybara.name,
          capybara.gender,
          capybara.coatColor
        );
      });
      
      // Draw ball
      drawBall(context, ball.x, ball.y);

      // Draw scores
      context.fillStyle = '#333';
      context.font = '20px Arial';
      context.fillText(`${score.player} - ${score.opponent}`, COURT_WIDTH / 2 - 25, 30);
      
      if (gameMessage) {
        context.fillStyle = 'rgba(0,0,0,0.7)';
        context.fillRect(COURT_WIDTH / 2 - 150, COURT_HEIGHT / 2 - 30, 300, 60);
        context.fillStyle = 'white';
        context.font = '18px Arial';
        context.textAlign = 'center';
        context.fillText(gameMessage, COURT_WIDTH / 2, COURT_HEIGHT / 2);
        context.textAlign = 'start';
      }
      
      // Draw touch controls for mobile mode
      if (gameMode === 'mobile') {
        // Left control
        context.fillStyle = 'rgba(0,0,0,0.2)';
        context.beginPath();
        context.arc(50, COURT_HEIGHT - 50, 30, 0, Math.PI * 2);
        context.fill();
        
        // Right control
        context.beginPath();
        context.arc(150, COURT_HEIGHT - 50, 30, 0, Math.PI * 2);
        context.fill();
        
        // Jump/hit control
        context.beginPath();
        context.arc(COURT_WIDTH - 80, COURT_HEIGHT - 50, 40, 0, Math.PI * 2);
        context.fill();
        
        // Arrows/icons
        context.fillStyle = 'white';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText('←', 50, COURT_HEIGHT - 45);
        context.fillText('→', 150, COURT_HEIGHT - 45);
        context.fillText('↑', COURT_WIDTH - 80, COURT_HEIGHT - 45);
        context.textAlign = 'start';
      }
    };

    render();
  }, [ball, playerCapybara, teammates, opponents, score, team, gameMessage, gameMode, playerName, gender, coatColor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameMode !== 'desktop') return; // Only use keyboard in desktop mode
      
      setLastPress(e.key);
      
      // Player movement
      switch(e.key) {
        case 'ArrowLeft':
          setPlayerCapybara(prev => ({
            ...prev,
            x: Math.max(prev.x - 20, 20)
          }));
          break;
        case 'ArrowRight':
          setPlayerCapybara(prev => ({
            ...prev,
            x: Math.min(prev.x + 20, COURT_WIDTH / 2 - 20)
          }));
          break;
        case ' ': // Spacebar to jump/hit
          if (Math.abs(playerCapybara.x - ball.x) < 50 && Math.abs(playerCapybara.y - ball.y) < 70) {
            // Hit the ball
            const dx = (ball.x - playerCapybara.x) / 5;
            const dy = -8; // Upward velocity
            setBallVelocity({ x: dx, y: dy });
            
            // Show message
            setGameMessage('Отличный удар!');
            setTimeout(() => setGameMessage(''), 1000);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerCapybara, ball, gameMode]);

  // Touch controls for mobile mode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (gameMode !== 'mobile') return; // Only use touch in mobile mode
      
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
      const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
      
      setTouchPosition({ x, y });
      
      // Left control
      if (distance({ x, y }, { x: 50, y: COURT_HEIGHT - 50 }) < 30) {
        setPlayerCapybara(prev => ({
          ...prev,
          x: Math.max(prev.x - 20, 20)
        }));
      }
      
      // Right control
      if (distance({ x, y }, { x: 150, y: COURT_HEIGHT - 50 }) < 30) {
        setPlayerCapybara(prev => ({
          ...prev,
          x: Math.min(prev.x + 20, COURT_WIDTH / 2 - 20)
        }));
      }
      
      // Jump/hit control
      if (distance({ x, y }, { x: COURT_WIDTH - 80, y: COURT_HEIGHT - 50 }) < 40) {
        if (Math.abs(playerCapybara.x - ball.x) < 50 && Math.abs(playerCapybara.y - ball.y) < 70) {
          // Hit the ball
          const dx = (ball.x - playerCapybara.x) / 5;
          const dy = -8; // Upward velocity
          setBallVelocity({ x: dx, y: dy });
          
          // Show message
          setGameMessage('Отличный удар!');
          setTimeout(() => setGameMessage(''), 1000);
        }
      }
    };
    
    const handleTouchEnd = () => {
      setTouchPosition(null);
    };
    
    if (gameMode === 'mobile') {
      canvas.addEventListener('touchstart', handleTouchStart);
      canvas.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameMode, playerCapybara, ball]);

  useEffect(() => {
    // Game loop for ball physics and game logic
    const updateGame = () => {
      // Ball physics
      setBall(prev => ({
        x: prev.x + ballVelocity.x,
        y: prev.y + ballVelocity.y
      }));
      
      // Gravity effect on ball
      setBallVelocity(prev => ({
        ...prev,
        y: prev.y + 0.2
      }));
      
      // Ball collision with floor
      if (ball.y > COURT_HEIGHT - 15) {
        // Check which side the ball landed
        if (ball.x < COURT_WIDTH / 2) {
          // Opponent scores
          setScore(prev => ({
            ...prev,
            opponent: prev.opponent + 1
          }));
          setGameMessage('Противник забил очко!');
        } else {
          // Player scores
          setScore(prev => ({
            ...prev,
            player: prev.player + 1
          }));
          setGameMessage('Ты забил очко!');
          onScorePoint();
        }
        
        // Reset ball
        setTimeout(() => {
          setBall({ x: COURT_WIDTH / 2, y: 50 });
          setBallVelocity({ x: Math.random() * 4 - 2, y: 3 });
          setGameMessage('');
        }, 1500);
      }
      
      // Ball collision with walls
      if (ball.x < 15 || ball.x > COURT_WIDTH - 15) {
        setBallVelocity(prev => ({
          ...prev,
          x: -prev.x * 0.8
        }));
      }
      
      // Ball collision with net
      if (ball.y > COURT_HEIGHT - NET_HEIGHT && 
          Math.abs(ball.x - COURT_WIDTH / 2) < 15) {
        setBallVelocity(prev => ({
          x: prev.x * 0.5,
          y: -prev.y * 0.5
        }));
      }
      
      // Simple AI for opponent capybaras
      const mainOpponent = opponents[1];
      if (ball.x > COURT_WIDTH / 2 && ball.y < COURT_HEIGHT - 50) {
        // Move toward ball
        const newX = mainOpponent.position.x + (ball.x > mainOpponent.position.x ? 3 : -3);
        setOpponents(prev => {
          const updated = [...prev];
          updated[1].position.x = Math.min(Math.max(newX, COURT_WIDTH / 2 + 20), COURT_WIDTH - 20);
          return updated;
        });
        
        // AI attempts to hit the ball
        if (Math.abs(mainOpponent.position.x - ball.x) < 40 && Math.abs(mainOpponent.position.y - ball.y) < 60) {
          const dx = (ball.x - mainOpponent.position.x) / 5;
          const dy = -7;
          setBallVelocity({ x: dx, y: dy });
        }
      }
      
      animationRef.current = requestAnimationFrame(updateGame);
    };
    
    animationRef.current = requestAnimationFrame(updateGame);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [ball, ballVelocity, onScorePoint]);

  // Get color for capybara based on team and coat color
  const getCapybaraColor = (capybaraTeam: Team, coat: CoatColor): string => {
    if (coat === 'normal') {
      // Team color for normal coat
      return capybaraTeam === 'pink' ? '#FF69B4' : 
             capybaraTeam === 'purple' ? '#8A2BE2' : 
             capybaraTeam === 'orange' ? '#FF7F50' : 
             '#98FB98';
    } else if (coat === 'albino') {
      return '#FFF0E0';
    } else if (coat === 'dark') {
      return '#8B4513';
    } else if (coat === 'black') {
      return '#333333';
    }
    
    // Fallback
    return '#8B4513';
  };

  const drawCapybara = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    capybaraTeam: Team,
    isPlayer = false,
    name: string,
    capybaraGender: Gender,
    capybaraCoat: CoatColor
  ) => {
    // Draw the name above the capybara
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y - 45);
    ctx.textAlign = 'start';
    
    // Get color based on coat type
    const capybaraColor = getCapybaraColor(capybaraTeam, capybaraCoat);
    
    // Body
    ctx.fillStyle = capybaraColor;
    ctx.beginPath();
    ctx.ellipse(x, y, 25, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.beginPath();
    ctx.ellipse(x - 5, y - 25, 15, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x - 10, y - 28, 2, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y - 28, 2, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyelashes for female capybaras
    if (capybaraGender === 'female') {
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#000';
      
      // Left eye eyelashes
      ctx.beginPath();
      ctx.moveTo(x - 12, y - 30);
      ctx.lineTo(x - 14, y - 32);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 30);
      ctx.lineTo(x - 10, y - 33);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 30);
      ctx.lineTo(x - 6, y - 32);
      ctx.stroke();
      
      // Right eye eyelashes
      ctx.beginPath();
      ctx.moveTo(x - 2, y - 30);
      ctx.lineTo(x - 4, y - 32);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x, y - 30);
      ctx.lineTo(x, y - 33);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x + 2, y - 30);
      ctx.lineTo(x + 4, y - 32);
      ctx.stroke();
    }
    
    // Nose
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x - 5, y - 22, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Player indicator
    if (isPlayer) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y - 45, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawBall = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Volleyball
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.stroke();
    
    // Ball details
    ctx.beginPath();
    ctx.arc(x, y, 15, Math.PI * 0.25, Math.PI * 0.75);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 15, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();
  };

  // Helper function to calculate distance between two points
  const distance = (point1: Position, point2: Position): number => {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <h2 className="text-xl font-bold mb-2">Волейбол Капибар</h2>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: getTeamColor(team) }}></div>
          <span>Ты играешь за {getTeamNameRussian(team)} команду</span>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <span>Твоя капибара:</span>
          <span>{gender === 'male' ? 'мужской' : 'женский'} пол,</span>
          <span>окрас: {getCoatColorName(coatColor)}</span>
        </div>
        
        {gameMode === 'desktop' ? (
          <div className="mb-4">
            <p className="text-sm text-gray-700">Управление (режим компьютера):</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <span className="bg-gray-200 px-2 py-1 rounded mr-2">←</span>
                <span>Влево</span>
              </div>
              <div className="flex items-center">
                <span className="bg-gray-200 px-2 py-1 rounded mr-2">→</span>
                <span>Вправо</span>
              </div>
              <div className="flex items-center">
                <span className="bg-gray-200 px-2 py-1 rounded mr-2">Пробел</span>
                <span>Ударить мяч</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-sm text-gray-700">Управление (мобильный режим):</p>
            <p className="text-xs text-gray-600">Используйте кнопки на экране для перемещения и удара</p>
          </div>
        )}
        
        {gameMode === 'desktop' && (
          <div className="bg-gray-100 rounded p-2 text-sm">
            <p>Последняя нажатая клавиша: {lastPress || "Нет"}</p>
          </div>
        )}
      </div>
      
      <canvas 
        ref={canvasRef} 
        width={COURT_WIDTH} 
        height={COURT_HEIGHT}
        className="border border-gray-300 rounded-lg shadow-md touch-manipulation"
      />
      
      <div className="mt-4 text-center">
        <p className="text-gray-600 text-sm">Набери 100% энергии для активации ультраспособности!</p>
      </div>
    </div>
  );
};

const getTeamColor = (team: Team): string => {
  switch (team) {
    case 'pink': return '#FF69B4';
    case 'purple': return '#8A2BE2';
    case 'orange': return '#FF7F50';
    case 'mint': return '#98FB98';
  }
};

const getTeamNameRussian = (team: Team): string => {
  switch (team) {
    case 'pink': return 'розовую';
    case 'purple': return 'фиолетовую';
    case 'orange': return 'оранжевую';
    case 'mint': return 'мятную';
  }
};

const getCoatColorName = (color: CoatColor): string => {
  switch (color) {
    case 'normal': return 'обычный';
    case 'albino': return 'альбинос';
    case 'dark': return 'темный';
    case 'black': return 'черный';
  }
};

export default CapybaraGame;
