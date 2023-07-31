import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, all, takeLatest } from 'redux-saga/effects';
import { Actions as AppActions } from 'store/slices';
import { DocumentsAction } from 'store/types';
import { Document } from 'types';
import { apiManager } from 'utils';

export function* getDocumentSaga(
  action: PayloadAction<DocumentsAction.GetDocumentRequestType>
): Generator {
  try {
    yield put(AppActions.loading.setLoading());

    const document: Document = (yield call(apiManager.getDocument, {
      id: action.payload.id,
    })) as Document;

    yield put(AppActions.loading.finishLoading());
    yield put(AppActions.documents.getDocumentSuccess({ document }));
  } catch (error) {
    if (action.payload.error) {
      action.payload.error();
    }

    yield put(AppActions.loading.finishLoading());
    yield put(AppActions.documents.getDocumentFailure());
  }
}

export function* saveDocumentSaga(
  action: PayloadAction<DocumentsAction.SaveDocumentRequestType>
): Generator {
  try {
    yield put(AppActions.loading.setLoading());

    let documents: Document[] = (yield call(
      apiManager.getDocuments
    )) as Document[];

    documents = [
      ...documents.map((document) => {
        if (document.id === action.payload.id) {
          return action.payload.document;
        } else {
          return document;
        }
      }),
    ];

    yield call(apiManager.saveDocuments, documents);

    yield put(AppActions.loading.finishLoading());
    if (action.payload.next) {
      action.payload.next();
    }
  } catch (error) {
    yield put(AppActions.loading.finishLoading());
    yield put(AppActions.documents.getDocumentFailure());
  }
}

export function* getDocumentSuggesetedLabelsSaga(
  action: PayloadAction<DocumentsAction.GetDocumentSuggesetedLabelsType>
): Generator {
  try {
    yield put(AppActions.loading.setLoading());

    const labels: string[] = (yield call(
      apiManager.getDocumentSuggesetedLabels
    )) as string[];

    yield put(AppActions.loading.finishLoading());
    if (action.payload.next) {
      action.payload.next(labels);
    }
  } catch (error) {
    yield put(AppActions.loading.finishLoading());
    yield put(AppActions.documents.getDocumentFailure());
  }
}

export const documentSaga = function* () {
  yield all([
    takeLatest(AppActions.documents.getDocumentRequest.type, getDocumentSaga),
    takeLatest(AppActions.documents.saveDocumentRequest.type, saveDocumentSaga),
    takeLatest(
      AppActions.documents.getDocumentSuggesetedLabelsRequest.type,
      getDocumentSuggesetedLabelsSaga
    ),
  ]);
};
