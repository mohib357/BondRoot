package com.svnstartech.bondroot.ui.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.button.MaterialButton;
import com.svnstartech.bondroot.R;
import com.svnstartech.bondroot.model.Person;
import com.svnstartech.bondroot.repository.PersonRepository;

import java.util.List;

public class CandidateAdapter extends RecyclerView.Adapter<CandidateAdapter.ViewHolder> {

    public interface OnCandidateSelectedListener {
        void onCandidateSelected(Person person);
    }

    private final List<Person> candidateList;
    private final PersonRepository repository;
    private final OnCandidateSelectedListener listener;

    public CandidateAdapter(List<Person> candidateList, PersonRepository repository, OnCandidateSelectedListener listener) {
        this.candidateList = candidateList;
        this.repository = repository;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_candidate, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        Person p = candidateList.get(position);
        boolean isEnglish = com.svnstartech.bondroot.util.LanguageManager.isEnglish(holder.itemView.getContext());
        holder.tvCandidateName.setText(p.getDisplayName(isEnglish));

        String fatherInfo = isEnglish ? "Father: Unknown" : "পিতা: জানা নেই";
        if (p.getFatherId() != null) {
            Person f = repository.getPersonById(p.getFatherId());
            if (f != null) {
                fatherInfo = (isEnglish ? "Father: " : "পিতা: ") + f.getDisplayName(isEnglish);
            }
        }
        String dob = p.getDateOfBirth() != null ? (" • " + (isEnglish ? "Birth: " : "জন্ম: ") + p.getDateOfBirth()) : "";
        holder.tvCandidateFather.setText(fatherInfo + dob);
        holder.tvCandidateId.setText("Person ID: " + p.getPersonId());
        holder.btnSelectCandidate.setText(isEnglish ? "Select as Father" : "ইনিই পিতা");

        holder.btnSelectCandidate.setOnClickListener(v -> {
            if (listener != null) listener.onCandidateSelected(p);
        });
    }

    @Override
    public int getItemCount() {
        return candidateList.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvCandidateName, tvCandidateFather, tvCandidateId;
        MaterialButton btnSelectCandidate;

        public ViewHolder(@NonNull View itemView) {
            super(itemView);
            tvCandidateName = itemView.findViewById(R.id.tvCandidateName);
            tvCandidateFather = itemView.findViewById(R.id.tvCandidateFather);
            tvCandidateId = itemView.findViewById(R.id.tvCandidateId);
            btnSelectCandidate = itemView.findViewById(R.id.btnSelectCandidate);
        }
    }
}
