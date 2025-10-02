// import React from 'react';
// // --- FIX: Import the main computer game screen ---
// import ComputerUI from "./computer/whortComputerUI"
// import WhotOnline from "./online/WhotOnline";
// import WhotBattleGroundUI from "./battleground/whotBattleGroundUI"

// import { useToast } from "@/src/hooks/useToast";

// type WhotIndexProps = {
//   mode: "computer" | "online" | "battle";
// };

// export default function WhotIndex({ mode }: WhotIndexProps) {
//   const { toast } = useToast();
//   // Note: The 'game' state is no longer needed for the computer mode,
//   // as WhotComputerGameScreen manages its own state.
//   // You might still need it for other modes.
//   const [game, setGame] = React.useState<any>(null);

//   React.useEffect(() => {
//     if (mode === "battle") {
//       toast({ title: "Welcome!", description: "Battle mode started", type: "info" });
//     }
//   }, [mode]);

//   // --- FIX: Render the full game screen component ---
//   if (mode === "computer") return <ComputerUI state={game} playerIndex={0} level={1} onStateChange={setGame} />;
  
//   if (mode === "online") return <WhotOnline toast={toast} />;
//   return <WhotBattleGroundUI toast={toast} />;
// }

import React from 'react';
// --- FIX: Import the main computer game screen ---
import WhotComputerGameScreen from "./computer/WhotComputerGameScreen"; 
import WhotOnline from "./online/WhotOnline";
import WhotBattleGroundUI from "./battleground/whotBattleGroundUI"

import { useToast } from "@/src/hooks/useToast";

type WhotIndexProps = {
  mode: "computer" | "online" | "battle";
};

export default function WhotIndex({ mode }: WhotIndexProps) {
  const { toast } = useToast();
  // Note: The 'game' state is no longer needed for the computer mode,
  // as WhotComputerGameScreen manages its own state.
  // You might still need it for other modes.
  const [game, setGame] = React.useState<any>(null);

  React.useEffect(() => {
    if (mode === "battle") {
      toast({ title: "Welcome!", description: "Battle mode started", type: "info" });
    }
  }, [mode]);

  // --- FIX: Render the full game screen component ---
  if (mode === "computer") return <WhotComputerGameScreen />;
  
  if (mode === "online") return <WhotOnline toast={toast} />;
  return <WhotBattleGroundUI toast={toast} />;
}