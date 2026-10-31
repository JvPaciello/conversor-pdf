import { fireEvent, render, screen } from '@testing-library/react';
import { getTool } from '@/lib/tools';
import { Dropzone } from '../converter/dropzone';

const word = getTool('word');
const images = getTool('imagem');

function file(name: string) {
  return new File(['conteúdo'], name);
}

function pick(input: HTMLElement, files: File[]) {
  fireEvent.change(input, { target: { files } });
}

function fileInput(container: HTMLElement) {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

describe('Dropzone', () => {
  it('passes accepted files on and limits single-file tools to one', () => {
    const onFiles = jest.fn();
    const { container } = render(<Dropzone formats={word.formats} onFiles={onFiles} buttonLabel="Escolher arquivo" />);
    pick(fileInput(container), [file('a.docx'), file('b.txt')]);
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: 'a.docx' })]);
    expect(fileInput(container)).toHaveAttribute('accept', '.docx,.txt');
  });

  it('explains how to handle old .doc files', () => {
    const onFiles = jest.fn();
    const { container } = render(<Dropzone formats={word.formats} onFiles={onFiles} buttonLabel="Escolher arquivo" />);
    pick(fileInput(container), [file('antigo.doc')]);
    expect(onFiles).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/salve como \.docx/i);
  });

  it('keeps valid images and reports the rest', () => {
    const onFiles = jest.fn();
    const { container } = render(
      <Dropzone formats={images.formats} multiple onFiles={onFiles} buttonLabel="Escolher imagens" />,
    );
    pick(fileInput(container), [file('a.jpg'), file('b.PNG'), file('c.gif')]);
    expect(onFiles.mock.calls[0][0].map((f: File) => f.name)).toEqual(['a.jpg', 'b.PNG']);
    expect(screen.getByRole('alert')).toHaveTextContent('“c.gif” não é aceito aqui');
  });

  it('accepts files dropped on it', () => {
    const onFiles = jest.fn();
    render(<Dropzone formats={word.formats} onFiles={onFiles} buttonLabel="Escolher arquivo" title="Solte aqui" />);
    const zone = screen.getByText('Solte aqui').parentElement!;
    fireEvent.drop(zone, { dataTransfer: { files: [file('contrato.docx')], types: ['Files'] } });
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: 'contrato.docx' })]);
  });
});
