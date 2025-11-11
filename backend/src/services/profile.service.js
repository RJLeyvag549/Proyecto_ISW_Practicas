"use strict";
import { AppDataSource } from "../config/configDb.js";
import ProfileSchema from "../entity/profile.entity.js";

const profileRepository = AppDataSource.getRepository("Profile");

export async function getOrCreateProfile(userId) {
  try {
    let profile = await profileRepository.findOne({
      where: { userId },
      relations: ["user"]
    });

    if (!profile) {
      profile = await profileRepository.save({
        userId,
        profileCompleted: false
      });
      
      profile = await profileRepository.findOne({
        where: { userId },
        relations: ["user"]
      });
    }

    return [profile, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function updateProfile(userId, profileData) {
  try {
    let profile = await profileRepository.findOne({
      where: { userId }
    });

    if (!profile) {
      profile = await profileRepository.save({
        userId,
        ...profileData,
        updatedAt: new Date()
      });
    } else {
      await profileRepository.update(
        { userId },
        {
          ...profileData,
          updatedAt: new Date()
        }
      );

      profile = await profileRepository.findOne({
        where: { userId },
        relations: ["user"]
      });
    }

    return [profile, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function updateProfileDocuments(userId, documents) {
  try {
    const profile = await profileRepository.findOne({
      where: { userId }
    });

    if (!profile) {
      return [null, "Perfil no encontrado"];
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (documents.curriculum !== undefined) {
      updateData.curriculum = documents.curriculum;
    }
    if (documents.coverLetter !== undefined) {
      updateData.coverLetter = documents.coverLetter;
    }

    await profileRepository.update({ userId }, updateData);

    const updatedProfile = await profileRepository.findOne({
      where: { userId },
      relations: ["user"]
    });

    return [updatedProfile, null];
  } catch (error) {
    return [null, error.message];
  }
}

export async function checkAndUpdateProfileCompletion(userId) {
  try {
    const profile = await profileRepository.findOne({
      where: { userId }
    });

    if (!profile) {
      return [null, "Perfil no encontrado"];
    }

    const isCompleted = Boolean(
      profile.career &&
      profile.curriculum &&
      profile.coverLetter
    );

    if (profile.profileCompleted !== isCompleted) {
      await profileRepository.update(
        { userId },
        { 
          profileCompleted: isCompleted,
          updatedAt: new Date()
        }
      );
    }

    const updatedProfile = await profileRepository.findOne({
      where: { userId },
      relations: ["user"]
    });

    return [updatedProfile, null];
  } catch (error) {
    return [null, error.message];
  }
}
