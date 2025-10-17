import { Autocomplete } from '@/components/ui';
import { closeModal } from '@/components/modal';
import Breadcrumbs from '@/components/breadcrumbs';
import UserVault from '@/lib/app/userVault';
import getElement from '@/lib/utils/getElement';
import { Content } from '@/types';

function pathMatch(path1: string[], path2: string[]) {
  return path1.join('/') === path2.join('/');
}

export default function PathManger({ item }: { item: Content }) {
  const path = [ ...UserVault.getViewPath() ];
  const breadcrumbsId = 'pathEditorBreadcrumbs';
  const autocompleteId = 'pathEditorAutocomplete';
  const submitBtnId = 'pathEditorSubmitBtn';

  return (
    <div className='flex flex-col gap-4'>
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
          console.log('pathManager submit')
          const pathInput = getElement<HTMLInputElement>(`#${autocompleteId}`);
          path.push(pathInput.value);
          pathInput.value = '';
          getElement(`#${breadcrumbsId}`).replaceChildren(
            <Breadcrumbs path={path} />
          );
          const submitBtn = getElement<HTMLButtonElement>(`#${submitBtnId}`);
          submitBtn.disabled = pathMatch(
            path.concat(item.title),
            UserVault.path.concat(item.title)
          );
        }}
        onFocus={(e) => {
          if (e.currentTarget.value === '') {
            e.currentTarget.placeholder = 'Backspace to change parent';
          }
        }}
        onBlur={(e) => e.currentTarget.placeholder = 'Change path'}
      />
      <button className='bg-fg text-bg p-2 rounded-lg disabled:opacity-50 disabled:!cursor-not-allowed'
        id={submitBtnId}
        disabled
        type='button'
        onClick={async () => {
          (await UserVault.move(
            UserVault.path.concat(item.title), path
          )).throw();
          closeModal();
        }}
      >Move</button>
    </div>
  )
}
