import { TagHandler } from '@/app/types';

// FIX ME decide if this should mutate tags array or not
// either way make sure modifySortedKeys acts the same way
// shallow change seems better
export const modifyTags: TagHandler = {
  add: (tags, inputTag) => (
    tags.includes(inputTag) ? tags : tags.concat(inputTag)
  ),
  delete: (tags, inputTag) => tags.filter(tag => tag !== inputTag),
};
