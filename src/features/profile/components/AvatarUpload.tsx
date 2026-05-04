'use client';

import { useRef, useState, useCallback } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/shared/lib/utils';

interface AvatarUploadProps {
    currentAvatarUrl: string | null;
    userName: string;
    userInitials: string;
    onUpload: (file: File) => Promise<string>;
    onAvatarChange: (url: string) => Promise<void>;
    isUploading?: boolean;
    className?: string;
}

export function AvatarUpload({
    currentAvatarUrl,
    userName,
    userInitials,
    onUpload,
    onAvatarChange,
    isUploading = false,
    className,
}: AvatarUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = useCallback(
        async (file: File) => {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Upload file and update profile
            try {
                const uploadedUrl = await onUpload(file);
                await onAvatarChange(uploadedUrl);
                setPreviewUrl(null);
            } catch (error) {
                setPreviewUrl(null);
            }
        },
        [onUpload, onAvatarChange]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const displayUrl = previewUrl || currentAvatarUrl;

    return (
        <div className={cn('relative group', className)}>
            <div
                className={cn(
                    'relative cursor-pointer transition-all duration-300',
                    isDragging && 'scale-105'
                )}
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-4 ring-[#00bae2]/20 transition-transform duration-300 group-hover:scale-105">
                    <AvatarImage src={displayUrl ?? ''} alt={userName} />
                    <AvatarFallback className="bg-gradient-to-br from-[#fec5fb] to-[#00bae2] text-white font-bold text-3xl">
                        {userInitials || 'U'}
                    </AvatarFallback>
                </Avatar>

                {/* Overlay */}
                <div
                    className={cn(
                        'absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                        isDragging && 'opacity-100 bg-[#00bae2]/40'
                    )}
                >
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    ) : (
                        <Camera className="h-8 w-8 text-white" />
                    )}
                </div>

                {/* Pulse ring when uploading */}
                {isUploading && (
                    <div className="absolute inset-0 rounded-full border-4 border-[#00bae2] animate-ping opacity-75" />
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
            />

            {/* Upload hint */}
            <p className="mt-3 text-center text-xs text-neutral-500">
                Click or drag to upload
            </p>
        </div>
    );
}
