import { useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Crown, 
  User,
  MoreVertical,
  Pin,
  VolumeX,
  UserMinus,
  Maximize2
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

// Types
export interface ParticipantInfo {
  id: string;
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  role: 'instructor' | 'learner' | 'observer';
  stream?: MediaStream | null;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  isSpeaking?: boolean;
  isPinned?: boolean;
}

export interface VideoTileProps {
  stream: MediaStream | null;
  participant: ParticipantInfo;
  isLocal?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
  onPin?: (userId: string) => void;
  onMute?: (userId: string) => void;
  onKick?: (userId: string) => void;
  showControls?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface VideoGridProps {
  participants: ParticipantInfo[];
  localUserId: string;
  isInstructor?: boolean;
  pinnedParticipantId?: string | null;
  onPin?: (participantId: string) => void;
  onMuteParticipant?: (participantId: string) => void;
  onKickParticipant?: (participantId: string) => void;
}

// Connection quality indicator
function ConnectionQualityIndicator({ quality }: { quality?: string }) {
  const bars = quality === 'excellent' ? 4 : quality === 'good' ? 3 : quality === 'fair' ? 2 : 1;
  const color = quality === 'excellent' ? 'bg-green-500' : quality === 'good' ? 'bg-green-400' : quality === 'fair' ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="flex items-end gap-0.5 h-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1 rounded-sm ${i <= bars ? color : 'bg-gray-300'}`}
          style={{ height: `${i * 3}px` }}
        />
      ))}
    </div>
  );
}

// Single Video Tile Component
export function VideoTile({
  stream,
  participant,
  isLocal = false,
  isPinned = false,
  onPin,
  onMute,
  onKick,
  showControls = true,
  size = 'medium'
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.warn);
    }
  }, [stream]);

  const sizeClasses = {
    small: 'h-32 w-44',
    medium: 'h-48 w-64',
    large: 'h-full w-full'
  };

  const hasVideo = participant.videoEnabled !== false && stream?.getVideoTracks().some(t => t.enabled);
  const hasAudio = participant.audioEnabled !== false;

  return (
    <div 
      className={`relative rounded-lg overflow-hidden bg-gray-900 ${sizeClasses[size]} ${
        isPinned ? 'ring-2 ring-blue-500' : ''
      } ${participant.isSpeaking ? 'ring-2 ring-green-500' : ''}`}
    >
      {/* Video Element */}
      {hasVideo && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        // Avatar placeholder when no video
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          {participant.avatarUrl ? (
            <img 
              src={participant.avatarUrl} 
              alt={participant.displayName || 'User'} 
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {participant.displayName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Overlay with user info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {participant.role === 'instructor' && (
              <Crown className="w-4 h-4 text-yellow-500" />
            )}
            <span className="text-white text-sm font-medium truncate max-w-[120px]">
              {participant.displayName || 'Unknown'}
              {isLocal && ' (You)'}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Connection quality */}
            <ConnectionQualityIndicator quality={participant.connectionQuality} />
            
            {/* Audio indicator */}
            {hasAudio ? (
              <Mic className="w-4 h-4 text-white" />
            ) : (
              <MicOff className="w-4 h-4 text-red-500" />
            )}
            
            {/* Video indicator */}
            {hasVideo ? (
              <Video className="w-4 h-4 text-white" />
            ) : (
              <VideoOff className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {/* Control dropdown (for instructor controlling other participants) */}
      {showControls && !isLocal && (onPin || onMute || onKick) && (
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {onPin && (
                <DropdownMenuItem onClick={() => onPin(participant.userId)}>
                  <Pin className="mr-2 h-4 w-4" />
                  {isPinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
              )}
              {onMute && (
                <DropdownMenuItem onClick={() => onMute(participant.userId)}>
                  <VolumeX className="mr-2 h-4 w-4" />
                  Mute
                </DropdownMenuItem>
              )}
              {onKick && (
                <DropdownMenuItem 
                  onClick={() => onKick(participant.userId)}
                  className="text-red-600"
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Pinned indicator */}
      {isPinned && (
        <div className="absolute top-2 left-2">
          <Badge className="bg-blue-600 text-white">
            <Pin className="w-3 h-3 mr-1" />
            Pinned
          </Badge>
        </div>
      )}

      {/* Local indicator */}
      {isLocal && (
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-black/50 text-white">
            You
          </Badge>
        </div>
      )}
    </div>
  );
}

// Calculate grid layout based on participant count
function calculateGridLayout(count: number): { cols: number; rows: number } {
  if (count <= 1) return { cols: 1, rows: 1 };
  if (count === 2) return { cols: 2, rows: 1 };
  if (count <= 4) return { cols: 2, rows: 2 };
  if (count <= 6) return { cols: 3, rows: 2 };
  if (count <= 9) return { cols: 3, rows: 3 };
  if (count <= 12) return { cols: 4, rows: 3 };
  return { cols: 4, rows: 4 }; // Max 16 visible
}

// Main VideoGrid Component
export default function VideoGrid({
  participants,
  localUserId,
  isInstructor = false,
  pinnedParticipantId,
  onPin,
  onMuteParticipant,
  onKickParticipant
}: VideoGridProps) {
  
  // Get pinned participant and other participants
  const pinnedParticipant = pinnedParticipantId 
    ? participants.find(p => p.userId === pinnedParticipantId)
    : null;
  
  const otherParticipants = participants.filter(p => p.userId !== pinnedParticipantId);

  const { cols, rows } = calculateGridLayout(otherParticipants.length);

  // Spotlight layout (when someone is pinned)
  if (pinnedParticipant) {
    return (
      <div className="h-full flex flex-col gap-2 p-2 bg-gray-950">
        {/* Main spotlight view */}
        <div className="flex-1 relative">
          <VideoTile
            stream={pinnedParticipant.stream || null}
            participant={pinnedParticipant}
            isLocal={pinnedParticipant.userId === localUserId}
            isPinned={true}
            onPin={onPin}
            onMute={isInstructor ? onMuteParticipant : undefined}
            onKick={isInstructor ? onKickParticipant : undefined}
            showControls={isInstructor || pinnedParticipant.userId === localUserId}
            size="large"
          />
          
          {/* Unpin button */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70"
            onClick={() => onPin?.('')}
          >
            <Maximize2 className="w-4 h-4 mr-1" />
            Exit Spotlight
          </Button>
        </div>

        {/* Thumbnail strip at bottom */}
        {otherParticipants.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {otherParticipants.map((participant) => (
              <VideoTile
                key={participant.userId}
                stream={participant.stream || null}
                participant={participant}
                isLocal={participant.userId === localUserId}
                isPinned={false}
                onPin={onPin}
                onMute={isInstructor ? onMuteParticipant : undefined}
                onKick={isInstructor ? onKickParticipant : undefined}
                showControls={isInstructor || participant.userId === localUserId}
                size="small"
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Grid layout (no one pinned)
  return (
    <div className="h-full w-full p-2 bg-gray-950">
      <div 
        className="h-full w-full grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {participants.slice(0, cols * rows).map((participant) => (
          <VideoTile
            key={participant.userId}
            stream={participant.stream || null}
            participant={participant}
            isLocal={participant.userId === localUserId}
            isPinned={participant.userId === pinnedParticipantId}
            onPin={onPin}
            onMute={isInstructor && participant.userId !== localUserId ? onMuteParticipant : undefined}
            onKick={isInstructor && participant.userId !== localUserId ? onKickParticipant : undefined}
            showControls={isInstructor || participant.userId === localUserId}
            size="large"
          />
        ))}
      </div>

      {/* Show overflow indicator if more than visible */}
      {participants.length > cols * rows && (
        <div className="absolute bottom-4 right-4">
          <Badge className="bg-blue-600">
            +{participants.length - cols * rows} more
          </Badge>
        </div>
      )}
    </div>
  );
}

// Participant List Sidebar Component
export function ParticipantList({
  participants,
  localUserId,
  isInstructor,
  onMuteUser,
  onKickUser
}: {
  participants: ParticipantInfo[];
  localUserId: string;
  isInstructor: boolean;
  onMuteUser?: (userId: string) => void;
  onKickUser?: (userId: string) => void;
}) {
  const instructors = participants.filter(p => p.role === 'instructor');
  const learners = participants.filter(p => p.role === 'learner');

  return (
    <Card className="w-64 h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <User className="w-4 h-4" />
          Participants ({participants.length})
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Instructors */}
        {instructors.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-2 px-2">
              Instructor
            </p>
            {instructors.map(p => (
              <ParticipantListItem 
                key={p.userId}
                participant={p}
                isLocal={p.userId === localUserId}
                showControls={isInstructor && p.userId !== localUserId}
                onMute={onMuteUser}
                onKick={onKickUser}
              />
            ))}
          </div>
        )}

        {/* Learners */}
        {learners.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase mb-2 px-2">
              Learners ({learners.length})
            </p>
            {learners.map(p => (
              <ParticipantListItem 
                key={p.userId}
                participant={p}
                isLocal={p.userId === localUserId}
                showControls={isInstructor}
                onMute={onMuteUser}
                onKick={onKickUser}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function ParticipantListItem({
  participant,
  isLocal,
  showControls,
  onMute,
  onKick
}: {
  participant: ParticipantInfo;
  isLocal: boolean;
  showControls: boolean;
  onMute?: (userId: string) => void;
  onKick?: (userId: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        {participant.avatarUrl ? (
          <img src={participant.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
        ) : (
          <span className="text-blue-600 text-sm font-bold">
            {participant.displayName?.charAt(0).toUpperCase() || 'U'}
          </span>
        )}
      </div>

      {/* Name and status */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          {participant.role === 'instructor' && (
            <Crown className="w-3 h-3 text-yellow-500" />
          )}
          <span className="text-sm font-medium truncate">
            {participant.displayName || 'Unknown'}
            {isLocal && ' (You)'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {participant.audioEnabled ? (
            <Mic className="w-3 h-3 text-green-500" />
          ) : (
            <MicOff className="w-3 h-3 text-red-500" />
          )}
          {participant.videoEnabled ? (
            <Video className="w-3 h-3 text-green-500" />
          ) : (
            <VideoOff className="w-3 h-3 text-red-500" />
          )}
        </div>
      </div>

      {/* Controls */}
      {showControls && !isLocal && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onMute && (
              <DropdownMenuItem onClick={() => onMute(participant.userId)}>
                <VolumeX className="mr-2 h-4 w-4" />
                Mute
              </DropdownMenuItem>
            )}
            {onKick && (
              <DropdownMenuItem 
                onClick={() => onKick(participant.userId)}
                className="text-red-600"
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Remove
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
