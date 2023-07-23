const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { owner } = useCasePayload;
    const addThread = new AddThread(useCasePayload);
    return this._threadRepository.postThread({ ...addThread, owner });
  }
}

module.exports = AddThreadUseCase;
