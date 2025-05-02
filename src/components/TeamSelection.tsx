
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type Team = 'pink' | 'purple' | 'orange' | 'mint';

interface TeamSelectionProps {
  selectedTeam: Team;
  onSelectTeam: (team: Team) => void;
}

const TeamSelection: React.FC<TeamSelectionProps> = ({ selectedTeam, onSelectTeam }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Выбери команду</h2>
      
      <RadioGroup 
        value={selectedTeam} 
        onValueChange={(value) => onSelectTeam(value as Team)}
        className="grid grid-cols-2 gap-4"
      >
        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-pink-50 transition-colors">
          <RadioGroupItem value="pink" id="pink" />
          <Label 
            htmlFor="pink" 
            className="flex items-center justify-between w-full cursor-pointer"
          >
            <span>Розовая команда</span>
            <div className="w-5 h-5 rounded-full bg-pink-400" />
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-purple-50 transition-colors">
          <RadioGroupItem value="purple" id="purple" />
          <Label 
            htmlFor="purple" 
            className="flex items-center justify-between w-full cursor-pointer"
          >
            <span>Фиолетовая команда</span>
            <div className="w-5 h-5 rounded-full bg-purple-600" />
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-orange-50 transition-colors">
          <RadioGroupItem value="orange" id="orange" />
          <Label 
            htmlFor="orange" 
            className="flex items-center justify-between w-full cursor-pointer"
          >
            <span>Оранжевая команда</span>
            <div className="w-5 h-5 rounded-full bg-orange-400" />
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-green-50 transition-colors">
          <RadioGroupItem value="mint" id="mint" />
          <Label 
            htmlFor="mint" 
            className="flex items-center justify-between w-full cursor-pointer"
          >
            <span>Мятная команда</span>
            <div className="w-5 h-5 rounded-full bg-green-300" />
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default TeamSelection;
