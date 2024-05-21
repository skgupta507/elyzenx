'use client';

import React, { useState, useMemo } from 'react';
import { Provider, Episode } from '@/types/api';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import _, { List } from 'lodash';

interface Props {
  animeData: Provider[];
  id: string;
}

const AnimeViewer: React.FC<Props> = ({ animeData, id }) => {
  const [selectedProvider, setSelectedProvider] = useState<
    Provider | undefined
  >(animeData.find((p) => p.providerId === 'zoro') || animeData[0]);
  const [language, setLanguage] = useState<'sub' | 'dub'>('sub');
  const [episodePage, setEpisodePage] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleProviderChange = (providerId: string) => {
    const provider = animeData.find((p) => p.providerId === providerId);
    setSelectedProvider(provider);
    setEpisodePage(0);
  };

  const episodes = useMemo(() => {
    return selectedProvider?.providerId === 'gogoanime'
      ? selectedProvider.episodes[language] || []
      : selectedProvider?.episodes || [];
  }, [selectedProvider, language]);

  const filteredEpisodes = useMemo(() => {
    return (episodes as Episode[]).filter(
      (episode) =>
        episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(episode.number).includes(searchQuery)
    );
  }, [searchQuery, episodes]);

  const episodeChunks = useMemo(
    () => _.chunk(filteredEpisodes as List<Episode>, 100),
    [filteredEpisodes]
  );
  const currentEpisodes = episodeChunks[episodePage] || [];

  return (
    <div className='p-4'>
      <div className='mb-4 flex gap-3'>
        <Select onValueChange={(e) => handleProviderChange(e)}>
          <SelectTrigger
            className='w-[130px]'
            value={selectedProvider?.providerId}
          >
            <SelectValue placeholder={selectedProvider?.providerId} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {animeData.map((provider) => (
                <SelectItem
                  key={
                    provider.providerId === 'zoro'
                      ? 'hianime'
                      : provider.providerId
                  }
                  value={provider.providerId}
                >
                  {provider.providerId === 'zoro'
                    ? 'hianime'
                    : provider.providerId}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {selectedProvider?.providerId === 'gogoanime' && (
          <Select
            onValueChange={(e) => setLanguage(e as 'sub' | 'dub')}
            value={language}
          >
            <SelectTrigger className='w-[130px]'>
              <SelectValue placeholder={language} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value='sub'>Sub</SelectItem>
                <SelectItem value='dub'>Dub</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        {episodeChunks.length > 1 && (
          <Select
            onValueChange={(e) => setEpisodePage(Number(e))}
            value={String(episodePage)}
          >
            <SelectTrigger className='w-[130px]'>
              <SelectValue
                placeholder={`${episodePage * 100 + 1}-${(episodePage + 1) * 100}`}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {episodeChunks.map((_, index) => (
                  <SelectItem key={index} value={String(index)}>
                    {index * 100 + 1}-{(index + 1) * 100}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        <input
          type='text'
          placeholder='Search episodes...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='ml-3 rounded border p-2'
        />
      </div>
      <div className='mt-20'>
        <ScrollArea className='h-[600px]'>
          {currentEpisodes.map((episode) => (
            <EpisodeCard
              key={episode.id || episode.episodeId}
              episode={episode}
              provider={selectedProvider?.providerId!}
              id={id}
              type={language}
            />
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

interface EpisodeCardProps {
  episode: Episode;
  provider: string;
  type: 'sub' | 'dub';
  id: string;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({
  episode,
  provider,
  type,
  id,
}) => {
  const episodeId = episode.id || episode.episodeId;
  return (
    <a
      href={`/watch/${id}?episodeId=${encodeURIComponent(episodeId!)}&provider=${provider}&type=${type}&number=${episode.number}`}
      className='mb-4 flex flex-col rounded border p-4 duration-300 hover:bg-gray-100 dark:hover:bg-gray-700/55 md:flex-row lg:flex-row xl:flex-row 2xl:flex-row'
    >
      <Image
        src={episode.img}
        alt={episode.title}
        width={1600}
        height={1600}
        className='mr-4 object-cover md:h-auto md:max-h-[150px] md:w-1/4 md:min-w-[20%] md:max-w-[20%] lg:h-auto lg:max-h-[150px] lg:w-1/4 lg:min-w-[20%] lg:max-w-[20%] xl:h-auto xl:max-h-[150px] xl:w-1/4 xl:min-w-[20%] xl:max-w-[20%] 2xl:h-auto 2xl:max-h-[150px] 2xl:w-1/4 2xl:min-w-[20%]  2xl:max-w-[20%]'
      />
      <div className='flex flex-col justify-center'>
        <h2 className='text-xl font-bold'>
          {episode.number} - {episode.title}
        </h2>
        <p>{episode.description}</p>
      </div>
    </a>
  );
};

export default AnimeViewer;
