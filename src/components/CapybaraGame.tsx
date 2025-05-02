
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type Team = 'pink' | 'purple' | 'orange' | 'mint';

interface CapybaraGameProps {
  team: Team;
  onScorePoint: () => void;
}

interface Position {
  x: number;
  y: number;
}

interface Capybara {
  team: Team;
  position: Position;
  isPlayer?: boolean;
}

const COURT_WIDTH = 600;
const COURT_HEIGHT = 400;
const NET_HEIGHT = 60;

const CapybaraGame: React.FC<CapybaraGameProps> = ({ team, onScorePoint }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ball, setBall] = useState<Position>({ x: COURT_WIDTH / 2, y: 50 });
  const [ballVelocity, setBallVelocity] = useState<Position>({ x: 0, y: 3 });
  const [playerCapybara, setPlayerCapybara] = useState<Position>({ x: COURT_WIDTH / 4, y: COURT_HEIGHT - 50 });
  const [teammates, setTeammates] = useState<Capybara[]>([
    { team, position: { x: COURT_WIDTH / 4 - 80, y: COURT_HEIGHT - 50 } },
    { team, position: { x: COURT_WIDTH / 4 + 80, y: COURT_HEIGHT - 50 } },
  ]);
  const [opponents, setOpponents] = useState<Capybara[]>([
    // We'll choose a random opposing team
    { team: getRandomOpposingTeam(team), position: { x: (COURT_WIDTH / 4) * 3 - 80, y: COURT_HEIGHT - 50 } },
    { team: getRandomOpposingTeam(team), position: { x: (COURT_WIDTH / 4) * 3, y: COURT_HEIGHT - 50 } },
    { team: getRandomOpposingTeam(team), position: { x: (COURT_WIDTH / 4) * 3 + 80, y: COURT_HEIGHT - 50 } },
  ]);
  const [score, setScore] = useState({ player: 0, opponent: 0 });
  const [gameMessage, setGameMessage] = useState('');
  const animationRef = useRef<number>();
  const [lastPress, setLastPress] = useState<string | null>(null);

  function getRandomOpposingTeam(playerTeam: Team): Team {
    const teams: Team[] = ['pink', 'purple', 'orange', 'mint'];
    const opposingTeams = teams.filter(t => t !== playerTeam);
    return opposingTeams[Math.floor(Math.random() * opposingTeams.length)];
  }

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

      // Draw player capybara
      drawCapybara(context, playerCapybara.x, playerCapybara.y, team, true);
      
      // Draw teammates
      teammates.forEach(capybara => {
        drawCapybara(context, capybara.position.x, capybara.position.y, capybara.team);
      });
      
      // Draw opponents
      opponents.forEach(capybara => {
        drawCapybara(context, capybara.position.x, capybara.position.y, capybara.team);
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
    };

    render();
  }, [ball, playerCapybara, teammates, opponents, score, team, gameMessage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [playerCapybara, ball]);

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

  const drawCapybara = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    capybaraTeam: Team,
    isPlayer = false
  ) => {
    const colors = {
      pink: '#FF69B4',
      purple: '#8A2BE2',
      orange: '#FF7F50',
      mint: '#98FB98'
    };
    
    // Body
    ctx.fillStyle = colors[capybaraTeam];
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
    
    // Nose
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

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <h2 className="text-xl font-bold mb-2">Волейбол Капибар</h2>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: getTeamColor(team) }}></div>
          <span>Ты играешь за {getTeamNameRussian(team)} команду</span>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-700">Управление:</p>
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
        
        <div className="bg-gray-100 rounded p-2 text-sm">
          <p>Последняя нажатая клавиша: {lastPress || "Нет"}</p>
        </div>
      </div>
      
      <canvas 
        ref={canvasRef} 
        width={COURT_WIDTH} 
        height={COURT_HEIGHT}
        className="border border-gray-300 rounded-lg shadow-md"
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

export default CapybaraGame;
