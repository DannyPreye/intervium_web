const fs = require('fs');

const inPath = 'page-original.tsx';
const outPath = 'src/lib/constants.ts';

const content = fs.readFileSync(inPath, 'utf8');
const lines = content.split('\n');

const const1 = lines.slice(38, 54).join('\n'); // OS_META etc
const const2 = lines.slice(352, 534).join('\n'); // STEALTH etc

const finalContent = 'import {\n' +
  '  EyeSlash,\n' +
  '  CursorClick,\n' +
  '  Lightning,\n' +
  '  ShieldCheck,\n' +
  '  MicrophoneStage,\n' +
  '  FileMagnifyingGlass,\n' +
  '  ChatTeardropText,\n' +
  '  BookOpen,\n' +
  '  type Icon as PhosphorIcon,\n' +
  '} from "@phosphor-icons/react";\n' +
  'import { OS } from "./types";\n\n' +
  const1 + '\n\n' + const2 + '\n';

const exportedContent = finalContent.replace(/^const /gm, 'export const ');

fs.writeFileSync(outPath, exportedContent);
