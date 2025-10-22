import { Autocomplete } from '@/components/ui';
import { Breadcrumbs } from '@/components/display';
import { closeModal } from '@/effects';
import UserVault from '@/lib/app/userVault';
import getElement from '@/lib/utils/getElement';
import { Content } from '@/types';

function pathMatch(path1: string[], path2: string[]) {
  return path1.join('/') === path2.join('/');
}

function updatePath(path: string[], item: Content) {
  getElement(`#${breadcrumbsId}`).replaceChildren(
    <Breadcrumbs path={path} />
  );
  getElement<HTMLButtonElement>(`#${submitBtnId}`).disabled = pathMatch(
    path.concat(item.title),
    UserVault.path.concat(item.title)
  );
}

// FIX ME move to constants file
export const breadcrumbsId = 'pathEditorBreadcrumbs';
export const autocompleteId = 'pathEditorAutocomplete';
export const submitBtnId = 'pathEditorSubmitBtn';
export const focusedPlaceholder = 'Backspace to change parent';
export const blurredPlaceholder = 'Change path';

export default function PathInput(
  {
    item,
    path
  }: {
    item: Content,
    path: string[]
  }
) {
  path = [ ...path ];

  return (
    <form className='flex flex-col gap-4'
      onSubmit={async (e) => {
        e.preventDefault();
        (await UserVault.move(
          UserVault.path.concat(item.title), path
        )).throw();
        closeModal();
      }}
    >
      <div className='defaultBorder'
        id={breadcrumbsId}
      >
        <Breadcrumbs path={path} />
      </div>
      <Autocomplete id={autocompleteId}
        placeholder='Change path'
        generator={() => {
          const newSegment = getElement<HTMLInputElement>(`#${autocompleteId}`).value;
          const folder = UserVault.get(path, 'folder').throw().data();
          return Object.keys(folder.contents).filter(title => {
            if (folder.contents[title].type !== 'folder') return;
            if (!title.toLowerCase().includes(newSegment.toLowerCase())) return;
            const invalidPath = pathMatch(
              path.concat(title),
              UserVault.path.concat(item.title)
            );
            if (invalidPath) return;
            return true;
          });
        }}
        onSubmit={() => {
          const pathInput = getElement<HTMLInputElement>(`#${autocompleteId}`);
          path.push(pathInput.value);
          pathInput.value = '';
          updatePath(path, item);
        }}
        onFocus={(e) => {
          if (e.currentTarget.value === '') {
            e.currentTarget.placeholder = focusedPlaceholder;
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && e.currentTarget.value === '') {
            path.splice(-1, 1);
            updatePath(path, item);
          }
        }}
        onBlur={(e) => e.currentTarget.placeholder = blurredPlaceholder}
      />
      <button className='bg-fg text-bg p-2 rounded-lg disabled:opacity-50 disabled:!cursor-not-allowed'
        id={submitBtnId}
        disabled
      >Move</button>
    </form>
  )
}
