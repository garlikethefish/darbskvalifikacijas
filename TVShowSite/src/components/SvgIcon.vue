<template>
  <span class="svg-icon" aria-hidden="true">
    <component v-if="iconComponent" :is="iconComponent" :size="size" color="currentColor" :weight="weight || undefined" />
  </span>
</template>

<script>
import {
  AltArrowDown, AltArrowUp, AltArrowLeft, AltArrowRight,
  Bell, BellBing,
  ChatRound, ChatDots, MentionCircle,
  Pen, Eye, List, AddCircle, Upload, Notes,
  Star, Heart, HeartBroken,
  Lock, LockUnlocked, Settings,
  TrashBinTrash, TrashBinMinimalistic,
  CheckCircle, Book, Chart, Logout,
  PlayCircle, CloseCircle, Planet, Planet3, Shield,
  Sun, Moon, MoonStars, Monitor,
  UserCircle, UsersGroupRounded, MedalStar,
  Fire, Crown, CrownStar, ShieldStar, Rocket,
  MaskSad, MaskHappy, Banknote, Danger, Ghost,
  CupStar, CupFirst, Atom, Clapperboard, Tv,
  History, QuestionCircle, Diploma, Bolt, Document,
  Target, Gamepad, ClockCircle, Translation,
  Camera, Videocamera,
  StarShine, Snowflake, StarRing, StarRainbow, StarFall,
  MagicStick, LinkRoundAngle, Waterdrops, Soundwave,
  Stars, CloudWaterdrops, Lightning, StarRings, Water, Palette, Bonfire
} from '@solar-icons/vue';

const ICONS = {
  'arrow-down':  AltArrowDown,
  'arrow-up':    AltArrowUp,
  'arrow-left':  AltArrowLeft,
  'arrow-right': AltArrowRight,
  'bell':        Bell,
  'bell-ring':   BellBing,
  'chat':        ChatRound,
  'chat-dots':   ChatDots,
  'mention':     MentionCircle,
  'edit':        Pen,
  'show':        Eye,
  'list':        List,
  'add-review':  AddCircle,
  'upload':      Upload,
  'note':        Notes,
  'star':        Star,
  'heart':       Heart,
  'heart-fill':  HeartBroken,
  'lock':        Lock,
  'lock-open':   LockUnlocked,
  'settings':    Settings,
  'trash':       TrashBinTrash,
  'trash-empty': TrashBinMinimalistic,
  'check':       CheckCircle,
  'book':        Book,
  'chart':       Chart,
  'log-out':     Logout,
  'play':        PlayCircle,
  'close':       CloseCircle,
  'globe':       Planet,
  'shield':      Shield,
  'sun':         Sun,
  'moon':        Moon,
  'monitor':     Monitor,
  'user':        UserCircle,
  'users':       UsersGroupRounded,
  'badge':       MedalStar,
  'fire':        Fire,
  'crown':       Crown,
  'crown-star':  CrownStar,
  'shield-star': ShieldStar,
  'rocket':      Rocket,
  'mask-sad':    MaskSad,
  'mask-happy':  MaskHappy,
  'banknote':    Banknote,
  'danger':      Danger,
  'ghost':       Ghost,
  'cup-star':    CupStar,
  'trophy':      CupFirst,
  'atom':        Atom,
  'clapperboard': Clapperboard,
  'tv':          Tv,
  'history':     History,
  'question':    QuestionCircle,
  'diploma':     Diploma,
  'bolt':        Bolt,
  'document':    Document,
  'translate':   Translation,
  'target':      Target,
  'gamepad':     Gamepad,
  'clock':       ClockCircle,
  'camera':      Camera,
  'video':       Videocamera,
  // Cosmetic effect icons
  'sparkle':     StarShine,
  'snowflake':   Snowflake,
  'glow':        StarRing,
  'rainbow':     StarRainbow,
  'star-fall':   StarFall,
  'magic':       MagicStick,
  'chain':       LinkRoundAngle,
  'drops':       Waterdrops,
  'aurora':      MoonStars,
  'soundwave':   Soundwave,
  'stars':       Stars,
  'cloud-drops': CloudWaterdrops,
  'lightning':   Lightning,
  'star-rings':  StarRings,
  'water':       Water,
  'planet3':     Planet3,
  'palette':     Palette,
  'bonfire':     Bonfire,
};

export default {
  name: 'SvgIcon',
  props: {
    name: { type: String, required: true },
    size: { type: Number, default: 20 },
    weight: { type: String, default: null },
  },
  computed: {
    iconComponent() {
      return ICONS[this.name] || null;
    },
  },
};
</script>

<style scoped>
.svg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  vertical-align: middle;
  color: var(--text-color);
}
</style>
