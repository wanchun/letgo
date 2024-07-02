import type { Extension } from '@codemirror/state';
import type { IPublicModelDocumentModel } from '@webank/letgo-types';

export interface CodeEditorProps {
    doc: string;
    hints?: Record<string, any>;
    compRef?: string;
    documentModel?: IPublicModelDocumentModel;
    height?: string;
    theme?: Record<string, any>;
    extensions?: Extension[];
    id?: string;
    placeholder?: string;
    onChange?: (doc: string, id?: string) => void;
    onFocus?: (doc: string, id?: string) => void;
    onBlur?: (doc: string, id?: string) => void;
}
